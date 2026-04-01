import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VideoPortraitDto {
  @IsString()
  @IsNotEmpty()
  imageBase64!: string;

  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsString()
  @IsNotEmpty()
  videoPrompt!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  stylePreset?: string;
}
