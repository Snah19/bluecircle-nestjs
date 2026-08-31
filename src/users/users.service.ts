// src/users/users.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findByUsername(
    username: string
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { username },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findPosts(
    {
      username,
      authUserId,
      page,
      limit,
    }: {
      username: string,
      authUserId?: string,
      page: number,
      limit: number,
    }
  ) {
    const viewerId = authUserId ?? "__unauthenticated__";

    const user = await this.prismaService.user.findUnique({
      where: {
        username
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: {
          userId: user.id,
        },
        include: {
          user: {
            omit: {
              password: true
            },
          },
          _count: {
            select: {
              likes: true,
              reposts: true,
              favorites: true,
              comments: true,
            },
          },
          likes: {
            where: { userId: viewerId },
            select: { id: true },
          },
          reposts: {
            where: { userId: viewerId },
            select: { id: true },
          },
          favorites: {
            where: { userId: viewerId },
            select: { id: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prismaService.post.count({
        where: {
          userId: user.id,
        }
      }),
    ]);

    const data = posts.map((p) => {
      const { _count, user, likes, reposts, favorites, ...fields } = p;

      return {
        ...fields,
        user,
        engagement: {
          likesCount: _count.likes,
          repostsCount: _count.reposts,
          favorites: _count.favorites,
          comments: _count.comments,
        },
        myEngagement: {
          isLiked: likes.length > 0,
          isReposted: reposts.length > 0,
          isFavorited: favorites.length > 0,
        }
      }
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      }
    };
  }
}