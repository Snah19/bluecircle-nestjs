// src/cloud-images/cloud-images.module.ts

import { Module } from "@nestjs/common";
import { CloudImagesController } from "./cloud-images.controller"; 
import { CloudImagesService } from "./cloud-images.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [CloudImagesService],
  controllers: [CloudImagesController],
  exports: [CloudImagesService],
})
export class CloudImagesModule {}