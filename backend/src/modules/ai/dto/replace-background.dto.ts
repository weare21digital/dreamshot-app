import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReplaceBackgroundDto {
  @IsString()
  @IsNotEmpty()
  imageBase64!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  prompt!: string;

  @IsOptional()
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';

  @IsOptional()
  @IsString()
  stylePreset?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  backgroundImageUrl?: string;
}
