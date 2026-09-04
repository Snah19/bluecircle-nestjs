import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CommentsService } from "./comments.service";
import { OptionalAuthGuard } from "src/auth/optional-auth.guard";
import { PaginateCommentsDto } from "./dto/paginate-comments.dto";

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
    @Body() dto: PaginateCommentsDto,
    @AuthUser() authUser?: { id: string },
  ) {
    return this.commentsService.findReplies({
      commentId,
      authUserId:  authUser?.id,
      page: dto.page,
      limit: dto.limit,
    });
  }
}