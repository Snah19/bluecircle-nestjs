import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { MeService } from "./me.service";


@Controller()
export class MeController {
  constructor(private meService: MeService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@AuthUser() authUser: { id: string }) {
    return this.meService.getMe(authUser.id);
  }
}