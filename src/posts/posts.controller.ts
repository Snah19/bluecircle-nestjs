// src/posts/posts.controller.ts

import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { OptionalAuthGuard } from "src/auth/optional-auth.guard";
import { PaginatePostsDto } from "./dto/paginate-posts.dto";

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get('discover')
  @UseGuards(OptionalAuthGuard)
  async getDiscoverPosts(
    @Query() query: PaginatePostsDto,
    @AuthUser() user?: { id: string },
  ) {
    return this.postsService.getDiscoverPosts({
      authUserId: user?.id,
      page: query.page,
      limit: query.limit,
    });
  }

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

  @Post(':id/reposts')
  @UseGuards(AuthGuard)
  async toggleRepost(
    @Param('id') id: string,
    @AuthUser() authUser: { id: string },
  ) {
    return this.postsService.toggleRepost({
      postId: id,
      authUserId: authUser.id,
    });
  }

  @Post(':id/favorites')
  @UseGuards(AuthGuard)
  async toggleFavorite(
    @Param('id') id: string,
    @AuthUser() authUser: { id: string },
  ) {
    return this.postsService.toggleFavorite({
      postId: id,
      authUserId: authUser.id,
    });
  }
}