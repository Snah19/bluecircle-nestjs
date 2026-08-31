// src/users/users.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findByUsername(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: { username },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`No user found with username "${username}"`);
    }

    return user;
  }
}