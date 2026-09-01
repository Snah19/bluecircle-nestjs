import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { UploadImagesService } from "./upload-images.service";
import { AuthGuard } from "src/auth/auth.guard";

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Controller('upload-images')
export class UploadImagesController {
  constructor(private uploadImagesService: UploadImagesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpeg|png|webp|gif)$/ }),
        ],
      })
    ) files: UploadedFile[],
  ) {
    const urls = await this.uploadImagesService.uploadImages(files);

    return urls;
  }
}