import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ReplaceBackgroundDto } from './dto/replace-background.dto';
import { VideoSubmitDto } from './dto/video-generation.dto';
import { VideoImagePipelineDto } from './dto/video-image-pipeline.dto';

@Injectable()
export class AiService {
  private readonly imageModel = process.env.FAL_IMAGE_MODEL || 'fal-ai/pulid';
  private readonly openAiImageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  private readonly imageBackend = process.env.IMAGE_BACKEND || 'openai';
  private readonly gptImagePercentage = Number(process.env.GPT_IMAGE_PERCENTAGE || '100');
  private readonly imageJobResults = new Map<string, { status: string; imageUrl?: string; error?: string; cancelled?: boolean }>();

  /** Upload a base64 image to fal.ai CDN and return the hosted URL */
  private async uploadToFal(base64: string, mimeType: string): Promise<string> {
    const apiKey = this.getFalApiKey();
    const buffer = Buffer.from(base64, 'base64');
    const ext = mimeType.includes('png') ? 'png' : 'jpg';

    const initResponse = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate', {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: `input.${ext}`,
        content_type: mimeType,
      }),
    });

    if (!initResponse.ok) {
      console.log('[uploadToFal] init failed:', initResponse.status, await initResponse.text().catch(() => ''));
      // Fallback: try data URI directly
      return `data:${mimeType};base64,${base64}`;
    }

    const initData = (await initResponse.json()) as { upload_url?: string; file_url?: string };
    if (!initData.upload_url || !initData.file_url) {
      return `data:${mimeType};base64,${base64}`;
    }

    const uploadResponse = await fetch(initData.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      console.log('[uploadToFal] upload failed:', uploadResponse.status);
      return `data:${mimeType};base64,${base64}`;
    }

    console.log('[uploadToFal] success:', initData.file_url);
    return initData.file_url;
  }

  private readonly styleSuffixMap: Record<string, string> = {
    realistic: 'photorealistic, natural skin tones, lifelike details, realistic camera optics',
    anime: 'anime style, cel-shaded, clean line art, vibrant colors, high detail',
    cinematic: 'cinematic lighting, dramatic contrast, film-like color grading, high dynamic range',
    illustration: 'digital illustration style, painterly texture, stylized but clear subject separation',
    fantasy: 'fantasy art style, magical atmosphere, rich colors, ethereal lighting',
    studio: 'clean studio look, professional softbox lighting, polished commercial style',
  };

  private async generateOpenAiImageUrl(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
    const imageBytes = Buffer.from(imageBase64, 'base64');

    const form = new FormData();
    form.append('model', this.openAiImageModel);
    form.append('prompt', prompt);
    form.append('size', '1024x1536');
    form.append('image', new Blob([imageBytes], { type: mimeType }), `selfie.${mimeType.includes('png') ? 'png' : 'jpg'}`);

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getOpenAiApiKey()}`,
      },
      body: form,
    });

    const data = (await response.json()) as {
      data?: Array<{ url?: string }>;
      error?: { message?: string };
    };

    const imageUrl = data?.data?.[0]?.url;
    if (!response.ok || !imageUrl) {
      throw new InternalServerErrorException(data?.error?.message || 'OpenAI image edit failed');
    }

    return imageUrl;
  }

  private async hostRemoteImageOnFal(remoteImageUrl: string): Promise<string> {
    const response = await fetch(remoteImageUrl, { method: 'GET' });
    if (!response.ok) {
      throw new InternalServerErrorException('Failed to fetch OpenAI image output for video pipeline');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return this.uploadToFal(base64, contentType);
  }

  private async generateFalImageUrl(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
    const apiKey = this.getFalApiKey();
    const imageUrl = await this.uploadToFal(imageBase64, mimeType);

    const imageResponse = await fetch(`https://fal.run/${this.imageModel}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference_images: [{ image_url: imageUrl }],
        prompt,
        negative_prompt: 'extra arms, extra hands, extra fingers, extra limbs, multiple arms, four arms, 3 arms, duplicate limbs, fused limbs, malformed hands, bad anatomy, flaws in the eyes, flaws in the face, lowres, low quality, worst quality, artifacts, noise, text, watermark, glitch, deformed, mutated, ugly, disfigured, blurry, modern clothing, t-shirt, casual wear',
        num_images: 1,
        guidance_scale: 1.2,
        num_inference_steps: 12,
        image_size: { width: 1024, height: 1536 },
        id_scale: 0.8,
        mode: 'fidelity',
      }),
    });

    const imageText = await imageResponse.text();
    let imageData: { images?: Array<{ url?: string }>; detail?: string };
    try {
      imageData = JSON.parse(imageText);
    } catch {
      throw new InternalServerErrorException(`Unexpected fal.ai image response: ${imageText.slice(0, 200)}`);
    }

    if (!imageResponse.ok) {
      throw new InternalServerErrorException(imageData?.detail || `Image generation failed (${imageResponse.status})`);
    }

    const generatedImageUrl = imageData?.images?.[0]?.url;
    if (!generatedImageUrl) {
      throw new InternalServerErrorException('Image generation returned no image');
    }

    return generatedImageUrl;
  }

  private shouldUseOpenAiForImage(): boolean {
    const backend = this.imageBackend.toLowerCase();
    if (backend === 'openai') {
      return true;
    }
    if (backend === 'fal') {
      return false;
    }

    const percentage = Number.isFinite(this.gptImagePercentage)
      ? Math.max(0, Math.min(100, this.gptImagePercentage))
      : 100;
    return Math.random() * 100 < percentage;
  }

  async submitImageGeneration(dto: ReplaceBackgroundDto): Promise<{
    requestId: string;
    status: string;
    statusUrl?: string;
    responseUrl?: string;
    cancelUrl?: string;
  }> {
    const imageBase64 = dto.imageBase64?.trim();
    if (!imageBase64) {
      throw new BadRequestException('imageBase64 is required');
    }

    const stylePreset = dto.stylePreset || 'realistic';
    const styleSuffix = this.styleSuffixMap[stylePreset] || this.styleSuffixMap.realistic;

    const prompt = `${dto.prompt}. ${styleSuffix}. High quality dreamshot image painting, single person, anatomically correct, two arms only.`;
    const requestId = `openai-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    try {
      const mimeType = dto.mimeType || 'image/jpeg';
      const imageUrl = this.shouldUseOpenAiForImage()
        ? await this.generateOpenAiImageUrl(imageBase64, mimeType, prompt)
        : await this.generateFalImageUrl(imageBase64, mimeType, prompt);

      this.imageJobResults.set(requestId, { status: 'COMPLETED', imageUrl });
    } catch (error) {
      this.imageJobResults.set(requestId, { status: 'FAILED', error: 'Image generation failed' });
      throw error;
    }

    return {
      requestId,
      status: 'COMPLETED',
      statusUrl: `openai://${requestId}/status`,
      responseUrl: `openai://${requestId}/result`,
      cancelUrl: `openai://${requestId}/cancel`,
    };
  }

  async getImageStatus(requestId: string, statusUrl?: string): Promise<{ status: string }> {
    const result = this.imageJobResults.get(requestId);
    if (!result) return { status: 'FAILED' };
    return { status: result.cancelled ? 'CANCELED' : result.status };
  }

  async getImageResult(requestId: string, responseUrl?: string): Promise<{ imageUrl: string }> {
    const result = this.imageJobResults.get(requestId);
    if (!result?.imageUrl) {
      throw new InternalServerErrorException(result?.error || 'Failed to retrieve image result');
    }

    return { imageUrl: result.imageUrl };
  }

  async cancelImageGeneration(requestId: string): Promise<{ cancelled: boolean }> {
    const current = this.imageJobResults.get(requestId);
    if (!current || current.status === 'COMPLETED') {
      return { cancelled: false };
    }

    this.imageJobResults.set(requestId, { ...current, cancelled: true, status: 'CANCELED' });
    return { cancelled: true };
  }

  // ---------- Video Generation (fal.ai) ----------

  private readonly videoModel = process.env.FAL_VIDEO_MODEL || 'fal-ai/wan/v2.2-5b/image-to-video';

  private getFalApiKey(): string {
    const key = process.env.FAL_API_KEY;
    if (!key) {
      throw new InternalServerErrorException('FAL_API_KEY is not configured on backend');
    }
    return key;
  }

  private getOpenAiApiKey(): string {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new InternalServerErrorException('OPENAI_API_KEY is not configured on backend');
    }
    return key;
  }

  async submitVideoGeneration(dto: VideoSubmitDto): Promise<{
    requestId: string;
    status: string;
    statusUrl?: string;
    responseUrl?: string;
    cancelUrl?: string;
  }> {
    const apiKey = this.getFalApiKey();
    const mimeType = dto.mimeType || 'image/jpeg';
    const imageDataUri = `data:${mimeType};base64,${dto.imageBase64}`;

    const response = await fetch(`https://queue.fal.run/${this.videoModel}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageDataUri,
        prompt: dto.prompt,
      }),
    });

    const data = (await response.json()) as {
      request_id?: string;
      status?: string;
      status_url?: string;
      response_url?: string;
      cancel_url?: string;
      detail?: string;
    };

    if (!response.ok || !data.request_id) {
      throw new InternalServerErrorException(data?.detail || 'Failed to submit video generation');
    }

    return {
      requestId: data.request_id,
      status: data.status || 'IN_QUEUE',
      statusUrl: data.status_url,
      responseUrl: data.response_url,
      cancelUrl: data.cancel_url,
    };
  }

  async getVideoStatus(requestId: string, statusUrl?: string): Promise<{ status: string }> {
    // debug log removed — too noisy during polling
    // If no statusUrl provided, this is a pre-fix job — just return FAILED so the client stops polling
    if (!statusUrl) {
      return { status: 'FAILED' };
    }
    const apiKey = this.getFalApiKey();

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: { Authorization: `Key ${apiKey}` },
    });

    const text = await response.text();
    let data: { status?: string; detail?: string };
    try {
      data = JSON.parse(text);
    } catch {
      throw new InternalServerErrorException(`Unexpected fal.ai response: ${text.slice(0, 200)}`);
    }

    if (!response.ok || !data.status) {
      throw new InternalServerErrorException(data?.detail || 'Failed to check video status');
    }

    return { status: data.status };
  }

  async getVideoResult(requestId: string, responseUrl?: string): Promise<{ videoUrl: string }> {
    if (!responseUrl) {
      throw new InternalServerErrorException('No response URL available for this job');
    }
    const apiKey = this.getFalApiKey();

    const response = await fetch(responseUrl, {
      method: 'GET',
      headers: { Authorization: `Key ${apiKey}` },
    });

    const text = await response.text();
    let data: {
      video?: { url?: string };
      output?: { video?: { url?: string } };
      detail?: string;
    };
    try {
      data = JSON.parse(text);
    } catch {
      throw new InternalServerErrorException(`Unexpected fal.ai response: ${text.slice(0, 200)}`);
    }

    const videoUrl = data?.video?.url || data?.output?.video?.url;

    if (!response.ok || !videoUrl) {
      throw new InternalServerErrorException(data?.detail || 'Failed to retrieve video result');
    }

    return { videoUrl };
  }

  async cancelVideoGeneration(requestId: string): Promise<{ cancelled: boolean }> {
    const apiKey = this.getFalApiKey();

    const response = await fetch(`https://queue.fal.run/${this.videoModel}/requests/${requestId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Key ${apiKey}` },
    });

    return { cancelled: response.ok };
  }

  // ---------- Image-to-Video Pipeline (OpenAI image edit → fal hosting → Wan) ----------

  async submitImagePipelineVideo(dto: VideoImagePipelineDto): Promise<{
    requestId: string;
    status: string;
    statusUrl?: string;
    responseUrl?: string;
    imageUrl?: string;
  }> {
    const imageBase64 = dto.imageBase64?.trim();
    if (!imageBase64) {
      throw new BadRequestException('imageBase64 is required');
    }

    const mimeType = dto.mimeType || 'image/jpeg';
    const apiKey = this.getFalApiKey();

    const stylePreset = dto.stylePreset || 'realistic';
    const styleSuffix = this.styleSuffixMap[stylePreset] || this.styleSuffixMap.realistic;

    // Step 1: Generate image with OpenAI (synchronous call)
    const imagePrompt = `${dto.prompt}. ${styleSuffix}. High quality dreamshot image painting, single person, anatomically correct, two arms only.`;
    const generatedImageUrl = await this.generateOpenAiImageUrl(imageBase64, mimeType, imagePrompt);

    // Step 2: Re-host generated image on fal storage before Wan submit
    const hostedImageUrl = await this.hostRemoteImageOnFal(generatedImageUrl);

    // Step 3: Submit generated image to video generation queue (Wan)
    const videoResponse = await fetch(`https://queue.fal.run/${this.videoModel}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: hostedImageUrl,
        prompt: dto.videoPrompt,
      }),
    });

    const videoData = (await videoResponse.json()) as {
      request_id?: string;
      status?: string;
      status_url?: string;
      response_url?: string;
      cancel_url?: string;
      detail?: string;
    };

    if (!videoResponse.ok || !videoData.request_id) {
      throw new InternalServerErrorException(videoData?.detail || 'Failed to submit video generation');
    }

    return {
      requestId: videoData.request_id,
      status: videoData.status || 'IN_QUEUE',
      statusUrl: videoData.status_url,
      responseUrl: videoData.response_url,
      imageUrl: generatedImageUrl,
    };
  }
}
