// src/posts/posts.controller.ts

import { Body, Controller, Delete, Get, Patch, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { OptionalAuthGuard } from "src/auth/optional-auth.guard";
import { PaginatePostsDto } from "./dto/paginate-posts.dto";
import { CreatePostDto } from "./dto/create-posts.dto";
import { PaginateCommentsDto } from "src/comments/dto/paginate-comments.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard)
  createPost(
    @Body() dto: CreatePostDto,
    @AuthUser() user: { id: string },
  ) {
    return this.postsService.createPost({
      authUserId: user.id,
      dto,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  updatePost(
    @AuthUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.updatePost({
      authUserId: user.id,
      postId: id,
      dto,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deletePost(
    @AuthUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.postsService.deletePost({
      authUserId: user.id,
      postId: id,
    });
  }

  @Get('discover')
  @UseGuards(OptionalAuthGuard)
  async findDiscoverPosts(
    @Query() query: PaginatePostsDto,
    @AuthUser() user?: { id: string },
  ) {
    return this.postsService.findDiscoverPosts({
      authUserId: user?.id,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('following')
  @UseGuards(OptionalAuthGuard)
  async findFollowingPosts(
    @Query() query: PaginatePostsDto,
    @AuthUser() user?: { id: string },
  ) {
    return this.postsService.findFollowingPosts({
      authUserId: user?.id,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async findPostDetail(
    @Param('id') id: string,
    @AuthUser() user?: { id: string },
  ) {
    return this.postsService.findPostDetail({
      authUserId: user?.id,
      postId: id,
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

  @Post(':id/saves')
  @UseGuards(AuthGuard)
  async toggleSave(
    @Param('id') id: string,
    @AuthUser() authUser: { id: string },
  ) {
    return this.postsService.toggleSave({
      postId: id,
      authUserId: authUser.id,
    });
  }

  @Get(":id/comments")
  @UseGuards(OptionalAuthGuard)
  async findComments(
    @Param("id") id: string,
    @Query() query: PaginateCommentsDto,
    @AuthUser() authUser?: { id: string },
  ) {
    return this.postsService.findComments({
      postId: id,
      authUserId: authUser?.id,
      page: query.page,
      limit: query.limit,
    });
  }
}