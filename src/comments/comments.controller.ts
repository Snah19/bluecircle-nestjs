import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CommentsService } from "./comments.service";
import { OptionalAuthGuard } from "src/auth/optional-auth.guard";
import { PaginateCommentsDto } from "./dto/paginate-comments.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";

@Controller("comments")
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post("posts/:postId")
  @UseGuards(AuthGuard)
  async createComment(
    @Param("postId") postId: string,
    @Body() dto: CreateCommentDto,
    @AuthUser() authUser: { id: string },
  ) {
    return this.commentsService.createComment({
      postId,
      authUserId: authUser.id,
      dto,
    });
  }

  @Post("/:commentId/likes")
  @UseGuards(AuthGuard)
  async toggleLikeComment(
    @Param("commentId") commentId: string,
    @AuthUser() authUser: { id: string },
  ) {
    return this.commentsService.toggleLikeComment({
      commentId,
      authUserId: authUser.id,
    });
  }

  @Get("/:commentId/replies")
  @UseGuards(OptionalAuthGuard)
  async findReplies(
    @Param("commentId") commentId: string,
    @Query() dto: PaginateCommentsDto,
    @AuthUser() authUser?: { id: string },
  ) {
    return this.commentsService.findReplies({
      commentId,
      authUserId: authUser?.id,
      page: dto.page,
      limit: dto.limit,
    });
  }

  @Delete("/:commentId")
  @UseGuards(AuthGuard)
  async deleteComment(
    @Param("commentId") commentId: string,
    @AuthUser() authUser: { id: string },
  ) {
    return this.commentsService.deleteComment({
      commentId,
      authUserId: authUser.id,
    });
  }

  @Patch("/:commentId")
  @UseGuards(AuthGuard)
  async updateComment(
    @Param("commentId") commentId: string,
    @Body() dto: UpdateCommentDto,
    @AuthUser() authUser: { id: string },
  ) {
    return this.commentsService.updateComment({
      commentId,
      authUserId: authUser.id,
      dto,
    });
  }
}