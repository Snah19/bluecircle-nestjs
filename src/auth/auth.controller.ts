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
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService){}

  @Post("create-account")
  createAccount(@Body() dto: RegisterDto) {
    return this.authService.createAccount(dto);
  }

  @Post("sign-in")
  signIn(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ) {
    return this.authService.signIn({
      dto,
      meta: {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      }
    });
  }

  @Post("sign-out")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async signOut(@Headers("authorization") authHeader: string) {
    const token = authHeader.slice("Bearer ".length).trim();
    await this.authService.signOut(token);
  }
}