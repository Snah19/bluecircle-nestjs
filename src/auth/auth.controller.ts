import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { type Request } from 'express';

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
}