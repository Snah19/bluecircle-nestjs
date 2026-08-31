import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { OptionalAuthGuard } from "./optional-auth.guard";

@Module({
  providers: [
    AuthService,
    OptionalAuthGuard,
  ],
  exports: [
    AuthService,
    OptionalAuthGuard,
  ]
})
export class AuthModule {}