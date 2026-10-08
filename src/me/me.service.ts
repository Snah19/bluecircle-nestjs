import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MeService {
  constructor(private prismaService: PrismaService) {}

  async findMe(authUserId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: authUserId,
      },
      omit: {
        password: true,
      }
    });

    return user;
  }

  async findSavedPosts({
    authUserId,
    page,
    limit,
  }: {
    authUserId: string;
    page: number;
    limit: number;
  }) {
    const skip = (page - 1) * limit;

    const [savedPosts, total] = await Promise.all([
      this.prismaService.save.findMany({
        where: { userId: authUserId },
        include: {
          post: {
            include: {
              user: {
                omit: { password: true },
              },
              _count: {
                select: {
                  likes: true,
                  reposts: true,
                  saves: true,
                  comments: true,
                },
              },
              likes: {
                where: { userId: authUserId },
                select: { id: true },
              },
              reposts: {
                where: { userId: authUserId },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),

      this.prismaService.save.count({
        where: { userId: authUserId },
      }),
    ]);

    const data = savedPosts.map(({ post }) => {
      const { _count, user: postUser, likes, reposts, ...postFields } = post;

      return {
        ...postFields,
        user: postUser,
        meta: {
          totalLikes: _count.likes,
          totalReposts: _count.reposts,
          totalSaves: _count.saves,
          totalComments: _count.comments,
        },
        viewer: {
          isLiked: likes.length > 0,
          isReposted: reposts.length > 0,
          isSaved: true,
        },
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}