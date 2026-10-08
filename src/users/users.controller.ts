// src/users/users.controller.ts

import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PaginatePostsDto } from "src/posts/dto/paginate-posts.dto";
import { OptionalAuthGuard } from "src/auth/optional-auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { PaginateFollowsDto } from "src/follows/dto/paginate-follows.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('/:username')
  @UseGuards(OptionalAuthGuard)
  findByUsername(
    @Param('username') username: string,
    @AuthUser() user?: { id: string },
  ) {
    return this.userService.findByUsername({
      username,
      authUserId: user?.id,
    });
  }

  @Get("/:username/followers")
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

  @Get("/:username/followings")
  @UseGuards(OptionalAuthGuard)
  findFollowings(
    @Param('username') username: string,
    @Query() query: PaginateFollowsDto,
    @AuthUser() user?: { id: string },
  ) {
    return this.userService.findFollowings({
      username,
      authUserId: user?.id,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('/:username/posts')
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

  @Get('/:username/reposts')
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

  @Get('/:username/likes')
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

  @Patch('/profile')
  @UseGuards(AuthGuard)
  updateProfile(
    @AuthUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile({
      authUserId: user.id,
      ...dto,
    });
  }
}