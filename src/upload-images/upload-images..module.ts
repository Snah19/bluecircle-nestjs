import { Module } from "@nestjs/common";
import { UploadImagesController } from "./upload-images.controller";
import { UploadImagesService } from "./upload-images.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [UploadImagesService],
  controllers: [UploadImagesController],
})
export class UploadImagesModule {}