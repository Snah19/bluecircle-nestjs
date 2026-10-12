import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";

const repliedToCommentSelect = {
  id: true,
  text: true,
  createdAt: true,
  user: {
    omit: {
      password: true,
    },
  },
} as const;

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
      dto: CreateCommentDto;
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

    let parentId: string | null = null;
    let repliedToCommentId: string | null = null;

    if (dto.replyToCommentId) {
      const targetComment = await this.prismaService.comment.findUnique({
        where: {
          id: dto.replyToCommentId,
        },
        select: {
          id: true,
          postId: true,
          parentId: true,
        }
      });

      if (!targetComment) {
        throw new NotFoundException("Comment not found");
      }

      if (targetComment.postId !== postId) {
        throw new BadRequestException("Comment does not belong to this post");
      }

      const isReplyingToRootComment = targetComment.parentId === null;

      parentId = isReplyingToRootComment ? targetComment.id : targetComment.parentId;
      repliedToCommentId = isReplyingToRootComment ? null : targetComment.id;
    }

    const comment = await this.prismaService.comment.create({
      data: {
        postId,
        userId: authUserId,
        parentId,
        repliedToCommentId,
        text: dto.text,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        repliedToComment: {
          select: repliedToCommentSelect,
        },
      }
    });

    return comment;
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
    const viewerId = authUserId ?? "__unauthenticated__";
    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      this.prismaService.comment.findMany({
        where: {
          parentId: commentId,
        },
        include: {
          user: {
            omit: {
              password: true,
            },
          },
          repliedToComment: {
            select: repliedToCommentSelect,
          },
          _count: {
            select: {
              likes: true,
            },
          },
          likes: {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        skip,
        take: limit,
      }),

      this.prismaService.comment.count({
        where: {
          parentId: commentId,
        }
      }),
    ]);

    const data = replies.map((c) => {
      const {
        _count,
        user,
        likes,
        repliedToComment,
        ...commentFields
      } = c;

      return {
        ...commentFields,
        user,
        repliedToComment,
        meta: {
          totalLikes: _count.likes,
          totalReplies: 0,
        },
        viewer: {
          isLiked: likes.length > 0,
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
      }
    }
  }

  async deleteComment({
    commentId,
    authUserId,
  }: {
    commentId: string;
    authUserId: string;
  }) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.userId !== authUserId) {
      throw new ForbiddenException("You can only delete your own comments");
    }

    await this.prismaService.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }

  async updateComment({
    commentId,
    authUserId,
    dto,
  }: {
    commentId: string;
    authUserId: string;
    dto: UpdateCommentDto;
  }) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.userId !== authUserId) {
      throw new ForbiddenException("You can only update your own comments");
    }

    const text = dto.text.trim();

    if (!text) {
      throw new BadRequestException("Comment text cannot be empty");
    }

    return this.prismaService.comment.update({
      where: { id: commentId },
      data: { text },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        repliedToComment: {
          select: repliedToCommentSelect,
        },
      },
    });
  }
}