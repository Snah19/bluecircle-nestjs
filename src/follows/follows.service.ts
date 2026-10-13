import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FollowsService {
  constructor(private prismaService: PrismaService) {}

  async toggleFollow({
    followerId,
    followingId,
  }: {
    followerId: string;
    followingId: string;
  }) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const userToFollow = await this.prismaService.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });

    if (!userToFollow) {
      throw new NotFoundException('User not found');
    }

    const existingFollow = await this.prismaService.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    await this.prismaService.$transaction(async (tx) => {
      if (existingFollow) {
        await tx.follow.delete({ where: { id: existingFollow.id } });

        await tx.notification.deleteMany({
          where: {
            fromId: followerId,
            toId: followingId,
            type: 'follow',
          },
        });
      } else {
        await tx.follow.create({ data: { followerId, followingId } });

        await tx.notification.create({
          data: {
            fromId: followerId,
            toId: followingId,
            type: 'follow',
          },
        });
      }
    });

    return {
      isFollowing: !existingFollow,
    };
  }
}