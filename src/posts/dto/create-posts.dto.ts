import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from "class-validator";

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];
}