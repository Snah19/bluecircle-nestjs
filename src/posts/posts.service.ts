// src/posts/posts.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService) {}

  async toggleLike(
    {
      postId,
      authUserId,
    } : {
      postId: string;
      authUserId: string;
    }
  ) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prismaService.like.findUnique({
      where: {
        userId_postId: {
          userId: authUserId,
          postId,
        }
      }
    });

    if (existingLike) {
      await this.prismaService.like.delete({
        where: {
          id: existingLike.id,
        }
      });
    }
    else {
      await this.prismaService.like.create({
        data: {
          userId: authUserId,
          postId,
        }
      });
    }

    const likesCount = await this.prismaService.like.count({
      where: {
        postId,
      }
    });

    return {
      isLiked: !existingLike,
      likesCount,
    }
  }
}