// src/posts/posts.module.ts

import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { CloudImagesModule } from "src/cloud-images/cloud-images.module";

@Module({
  imports: [AuthModule, CloudImagesModule],
  providers: [PostsService],
  exports: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}