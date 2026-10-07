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
  bio!: string | null;

  @IsOptional()
  @IsUrl()
  profileImageUrl!: string | null;

  @IsOptional()
  @IsUrl()
  coverImageUrl!: string | null;
}