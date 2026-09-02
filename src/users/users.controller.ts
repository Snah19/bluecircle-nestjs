// src/users/users.controller.ts

import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PaginatePostsDto } from "src/posts/dto/paginate-posts.dto";
import { OptionalAuthGuard } from "src/auth/optional-auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { PaginateFollowsDto } from "src/follows/dto/paginate-follows.dto";

@Controller('users/:username')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  findByUsername(
    @Param('username') username: string
  ) {
    return this.userService.findByUsername(username);
  }

  @Get("followers")
  @UseGuards(OptionalAuthGuard)
  findFollowers(
    @Param('username') username: string,
    @Query() query: PaginateFollowsDto,
    @AuthUser() user?: { id: string },
  ) {
    return this.userService.findFollowers({
      username,
      authUserId: user?.id,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('posts')
  @UseGuards(OptionalAuthGuard)
  findPosts(
    @Param('username') username: string,
    @Query() query: PaginatePostsDto,
    @AuthUser() user?: { id: string },
  ) {
    return this.userService.findPosts({
      username,
      authUserId: user?.id,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('reposts')
  @UseGuards(OptionalAuthGuard)
  findRepostedPosts(
    @Param('username') username: string,
    @Query() query: PaginatePostsDto,
    @AuthUser() user?: { id: string },    
  ){
    return this.userService.findRepostedPosts({
      username,
      authUserId: user?.id,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('likes')
  @UseGuards(OptionalAuthGuard)
  findLikedPosts(
    @Param('username') username: string,
    @Query() query: PaginatePostsDto,
    @AuthUser() user?: { id: string },    
  ) {
    return this.userService.findLikedPosts({
      username,
      authUserId: user?.id,
      page: query.page,
      limit: query.limit,    
    });
  }

  @Get('favorites')
  @UseGuards(OptionalAuthGuard)
  findFavoritedPosts(
    @Param('username') username: string,
    @Query() query: PaginatePostsDto,
    @AuthUser() user?: { id: string },    
  ) {
    return this.userService.findFavoritedPosts({
      username,
      authUserId: user?.id,
      page: query.page,
      limit: query.limit,    
    });
  }
}