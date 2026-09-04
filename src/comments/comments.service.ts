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
    let mentionedUserId: string | null = null;

    if (dto.parentId) {
      const parentComment = await this.prismaService.comment.findUnique({
        where: {
          id: dto.parentId,
        },
        select: {
          id: true,
          postId: true,
          parentId: true,
          userId: true,
        }
      });

      if (!parentComment) {
        throw new NotFoundException("Parent comment not found");
      }

      if (parentComment.postId !== postId) {
        throw new BadRequestException("Parent comment does not belong to this post");
      }

      parentId = parentComment.parentId ?? parentComment.id;

      const isReplyingToParentComment = parentComment.parentId === null;
      mentionedUserId = isReplyingToParentComment ? null : parentComment.userId;
    }

    const comment = await this.prismaService.comment.create({
      data: {
        postId,
        userId: authUserId,
        parentId,
        mentionedUserId,
        text: dto.text,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        mentionedUser: {
          omit: {
            password: true,
          },
        }
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
          mentionedUser: {
            omit: {
              password: true,
            },
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
        mentionedUser,
        ...commentFields
      } = c;

      return {
        ...commentFields,
        user,
        mentionedUser,
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
}