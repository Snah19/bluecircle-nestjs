import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";

@Module({
  imports: [AuthModule],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}