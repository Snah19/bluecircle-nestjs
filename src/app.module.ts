// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { UploadImagesModule } from './upload-images/upload-images..module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PostsModule,
    UploadImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
