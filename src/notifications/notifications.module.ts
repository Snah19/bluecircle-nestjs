import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";

@Module({
  imports: [AuthModule],
  providers: [NotificationsService],
  controllers: [NotificationsController]
})
export class NotificationsModule {}