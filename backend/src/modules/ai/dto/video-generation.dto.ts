import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VideoSubmitDto {
  @IsString()
  @IsNotEmpty()
  imageBase64: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class VideoStatusDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;
}

export class VideoResultDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;
}
