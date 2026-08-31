// src/posts/posts.module.ts

import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";

@Module({
  imports: [AuthModule],
  providers: [PostsService],
  exports: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}