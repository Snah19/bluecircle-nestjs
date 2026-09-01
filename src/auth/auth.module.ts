import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { OptionalAuthGuard } from "./optional-auth.guard";
import { AuthController } from "./auth.controller";

@Module({
  providers: [
    AuthService,
    OptionalAuthGuard,
  ],
  exports: [
    AuthService,
    OptionalAuthGuard,
  ],
  controllers: [AuthController],
})
export class AuthModule {}