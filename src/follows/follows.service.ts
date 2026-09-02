import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FollowsService {
  constructor(private prismaService: PrismaService) {}

  async toggleFollow(
    {
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }
  ) {
    const existingFollow = await this.prismaService.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        }
      }
    });

    if (existingFollow) {
      await this.prismaService.follow.delete({
        where: {
          id: existingFollow.id,
        }
      });
    }
    else {
      await this.prismaService.follow.create({
        data: {
          followerId,
          followingId,
        }
      });
    }

    return {
      isFollowing: !existingFollow,
    };
  }
}