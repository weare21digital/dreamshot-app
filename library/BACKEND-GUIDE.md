# DreamShot — Backend Guide

Documents backend conventions for DreamShot.

## API Routes

- Framework: NestJS controllers under `backend/src/modules/*/*.controller.ts`
- Pattern: thin controllers, business logic in services
- Validation: DTOs + class-validator in module `dto/` folders

## Services

- Location: `backend/src/modules/*/*.service.ts`
- Pattern: provider-specific API calls and mapping stay in service layer
- AI provider split:
  - Image generation primary provider: OpenAI `gpt-image-1`
  - Video generation provider: fal.ai (`fal-ai/wan/v2.2-5b/image-to-video`)
  - Image→video pipeline keeps fal.ai for video submit path

## Configuration

- Secrets come from environment variables (`.env`), never hardcoded
- Current AI env vars:
  - `OPENAI_API_KEY` for image generation
  - `OPENAI_IMAGE_MODEL` optional override (defaults to `gpt-image-1`)
  - `FAL_API_KEY` for video generation and pipeline
  - `FAL_VIDEO_MODEL` optional override for video model

## Database

- ORM: Prisma (`backend/prisma`)
- Commands:
  - Generate client: `npm run db:generate`
  - Dev migration: `npm run db:migrate`
  - Deploy migration: `npm run db:migrate:deploy`
