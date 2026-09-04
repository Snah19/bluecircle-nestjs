import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class CommentsService {
  constructor(private prismaService: PrismaService) {}

  async createComment(
    {
      postId,
      authUserId,
      dto,
    }: {
      postId: string;
      authUserId: string;
      dto: CreateCommentDto,
    }
  ) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      }
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (dto.parentId) {
      const parent = await this.prismaService.comment.findUnique({
        where: {
          id: dto.parentId,
        },
      });

      if (!parent) {
        throw new NotFoundException("Parent comment not found");
      }
      if (parent.postId !== postId) {
        throw new BadRequestException("Parent comment does not belong to this post");
      }
    }

    const comment = await this.prismaService.comment.create({
      data: {
        postId,
        userId: authUserId,
        parentId: dto.parentId ?? null,
        text: dto.text,
      },
      include: {
        user: {
          omit: {
            password: true,
          }
        },
      },
    });

    return {
      ...comment,
      user: comment.user,
    }
  }

  async toggleLikeComment(
    {
      commentId,
      authUserId,
    }: {
      commentId: string;
      authUserId: string;
    }
  ) {
    const comment = await this.prismaService.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    const existingLike = await this.prismaService.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: authUserId,
          commentId,
        },
      },
    });

    if (existingLike) {
      await this.prismaService.commentLike.delete({
        where: {
          id: existingLike.id,
        }
      });
    }
    else {
      await this.prismaService.commentLike.create({
        data: {
          userId: authUserId,
          commentId,
        },
      });
    }

    const totalLikes = await this.prismaService.commentLike.count({
      where: {
        commentId,
      }
    });

    return {
      isLiked: !existingLike,
      totalLikes,
    };
  }

  async findReplies({
    commentId,
    authUserId,
    page,
    limit,
  }: {
    commentId: string;
    authUserId?: string;
    page: number;
    limit: number;
  }) {
    
  }
}