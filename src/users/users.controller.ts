// src/users/users.controller.ts

import { Controller, Get, Param, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PaginatePostsDto } from "src/posts/dto/paginate-posts.dto";

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
  findPosts(
    @Param('username') username: string,
    @Query() query: PaginatePostsDto,
  ) {
    return this.userService.findPosts(
      username,
      query.page,
      query.limit,
    );
  }
}