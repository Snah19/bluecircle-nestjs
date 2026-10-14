import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { getRelationshipStatus } from "src/users/utils/get-relationship-status";
import { Prisma } from '../../prisma/generated/prisma/client';

@Injectable()
export class SearchService {
  constructor(
    private prismaService: PrismaService,
  ) {}

  async searchUsers({
    authUserId,
    query,
    page,
    limit,
  }: {
    authUserId?: string;
    query: string;
    page: number;
    limit: number;
  }) {
    const q = query.trim().replace(/^@/, "");

    if (!q) {
      return { data: [], meta: { total: 0, page, limit, lastPage: 0 } };
    }

    const where: Prisma.UserWhereInput = {
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { fullname: { contains: q, mode: "insensitive" } },
      ],
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        omit: { password: true, email: true },
        orderBy: [
          { followers: { _count: "desc" } },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),

      this.prismaService.user.count({ where }),
    ]);

    const userIds = users.map((u) => u.id);

    const [viewerFollowings, viewerFollowers] = authUserId && userIds.length
      ? await Promise.all([
          this.prismaService.follow.findMany({
            where: { followerId: authUserId, followingId: { in: userIds } },
            select: { followingId: true },
          }),
          this.prismaService.follow.findMany({
            where: { followerId: { in: userIds }, followingId: authUserId },
            select: { followerId: true },
          }),
        ])
      : [[], []];

    const viewerFollowingSet = new Set(viewerFollowings.map((f) => f.followingId));
    const viewerFollowerSet = new Set(viewerFollowers.map((f) => f.followerId));

    const data = users.map((u) => ({
      ...u,
      viewer: {
        isSelf: u.id === authUserId,
        relationshipStatus: getRelationshipStatus(
          viewerFollowingSet.has(u.id),
          viewerFollowerSet.has(u.id),
        ),
      },
    }));

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }
}