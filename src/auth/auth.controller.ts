import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { type Request } from 'express';
import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService){}

  @Post("login")
  login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ) {
    return this.authService.login({
      dto,
      meta: {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      }
    });
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async logout(@Headers("authorization") authHeader: string) {
    const token = authHeader.slice("Bearer ".length).trim();
    await this.authService.logout(token);
  }
}