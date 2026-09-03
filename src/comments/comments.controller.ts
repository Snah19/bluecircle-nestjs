import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { AuthUser } from "src/auth/auth-user.decorator";
import { CommentsService } from "./comments.service";

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
    this.commentsService.createComment({
      postId,
      authUserId: authUser.id,
      dto,
    });
  }
}