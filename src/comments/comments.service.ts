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
}