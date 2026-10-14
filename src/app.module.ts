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
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';

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
    NotificationsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
