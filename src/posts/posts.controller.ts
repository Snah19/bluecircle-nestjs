// src/posts/posts.controller.ts

import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post(':id/likes')
  @UseGuards(AuthGuard)
  async toggleLike(
    @Param('id') id: string,
    @AuthUser() authUser: { id: string },
  ) {
    return this.postsService.toggleLike({
      postId: id,
      authUserId: authUser.id,
    });
  }
}