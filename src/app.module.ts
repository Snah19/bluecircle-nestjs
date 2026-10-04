// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { UploadImagesModule } from './upload-images/upload-images..module';
import { AuthModule } from './auth/auth.module';
import { FollowsModudle } from './follows/follows.module';
import { CommentsModule } from './comments/comments.module';
import { MeModule } from './me/me.module';
import { CloudImagesModule } from './cloud-images/cloud-images.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    MeModule,
    PostsModule,
    FollowsModudle,
    CommentsModule,
    UploadImagesModule,
    CloudImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
