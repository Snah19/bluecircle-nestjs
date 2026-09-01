import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

const EXTENSION_BY_MIMETYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

@Injectable()
export class UploadImagesService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      }
    });

    this.bucket = process.env.R2_BUCKET!;
    this.publicUrl = process.env.R2_URL!;
  }

  async uploadImages(files: UploadedFile[]): Promise<(string | null)[]> {
    const urls = await Promise.allSettled(
      files.map(async (f) => {
        const extension = EXTENSION_BY_MIMETYPE[f.mimetype] ?? 'bin';
        const filename = `${randomUUID()}.${extension}`;

        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: filename,
            Body: f.buffer,
            ContentType: f.mimetype,
          }),
        );

        return `${this.publicUrl}/${filename}`;
      })
    );

    return urls.map((u) => {
      if (u.status === 'rejected') {
        console.error(`Image upload failed: ${u.reason}`);
        return null;
      }

      return u.value;
    });
  }
}