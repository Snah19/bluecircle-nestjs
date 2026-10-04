import { IsArray, IsUrl } from "class-validator";

export class CreatePostDto {
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls!: string[];
}