import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { FollowsService } from "./follows.service";
import { FollowsController } from "./follows.controller";

@Module({
  imports: [AuthModule],
  providers: [FollowsService],
  controllers: [FollowsController],
})
export class FollowsModudle {}