// src/posts/dto/update-post.dto.ts

import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from "class-validator";

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(400)
  text?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl({}, { each: true })
  imageUrls?: string[];
}