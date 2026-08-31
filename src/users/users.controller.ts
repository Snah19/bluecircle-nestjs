// src/users/users.controller.ts

import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller('users/:username')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  findByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }  
}