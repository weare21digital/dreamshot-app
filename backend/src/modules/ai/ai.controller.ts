import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ReplaceBackgroundDto } from './dto/replace-background.dto';
import { VideoSubmitDto } from './dto/video-generation.dto';
import { VideoImagePipelineDto } from './dto/video-image-pipeline.dto';

// Auth guard removed — DreamShot is a no-login freemium app
// TODO: Add API key or rate-limiting guard before production
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('image/submit')
  async submitImage(@Body() dto: ReplaceBackgroundDto) {
    return this.aiService.submitImageGeneration(dto);
  }

  @Get('image/status/:requestId')
  async getImageStatus(@Param('requestId') requestId: string, @Query('statusUrl') statusUrl?: string) {
    return this.aiService.getImageStatus(requestId, statusUrl);
  }

  @Get('image/result/:requestId')
  async getImageResult(@Param('requestId') requestId: string, @Query('responseUrl') responseUrl?: string) {
    return this.aiService.getImageResult(requestId, responseUrl);
  }

  @Put('image/cancel/:requestId')
  async cancelImage(@Param('requestId') requestId: string) {
    return this.aiService.cancelImageGeneration(requestId);
  }

  @Post('video/image-pipeline')
  async submitImagePipelineVideo(@Body() dto: VideoImagePipelineDto) {
    return this.aiService.submitImagePipelineVideo(dto);
  }

  // Backward-compatible route kept for older clients.
  @Post('video/portrait-pipeline')
  async submitPortraitVideo(@Body() dto: VideoImagePipelineDto) {
    return this.aiService.submitImagePipelineVideo(dto);
  }

  @Post('video/submit')
  async submitVideo(@Body() dto: VideoSubmitDto) {
    return this.aiService.submitVideoGeneration(dto);
  }

  @Get('video/status/:requestId')
  async getVideoStatus(@Param('requestId') requestId: string, @Query('statusUrl') statusUrl?: string) {
    return this.aiService.getVideoStatus(requestId, statusUrl);
  }

  @Get('video/result/:requestId')
  async getVideoResult(@Param('requestId') requestId: string, @Query('responseUrl') responseUrl?: string) {
    return this.aiService.getVideoResult(requestId, responseUrl);
  }

  @Put('video/cancel/:requestId')
  async cancelVideo(@Param('requestId') requestId: string) {
    return this.aiService.cancelVideoGeneration(requestId);
  }
}
