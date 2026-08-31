// src/users/users.controller.ts

import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PaginatePostsDto } from "src/posts/dto/paginate-posts.dto";
import { OptionalAuthGuard } from "src/auth/optional-auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";

@Controller('users/:username')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  findByUsername(
    @Param('username') username: string
  ) {
    return this.userService.findByUsername(username);
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
}