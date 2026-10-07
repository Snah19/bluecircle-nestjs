import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @MaxLength(64)
  fullname!: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  bio!: string;

  @IsOptional()
  @IsUrl()
  profileImageUrl!: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl!: string;
}