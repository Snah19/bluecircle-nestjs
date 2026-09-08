import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MeService {
  constructor(private prismaService: PrismaService) {}

  async getMe(authUserId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: authUserId,
      },
      omit: {
        password: true,
      }
    });

    return user;
  }
}