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
  - Image generation primary provider: OpenAI `gpt-image-1` via `POST /v1/images/edits`
  - Selfie preservation pattern: pass user selfie as `image` multipart input to OpenAI edits endpoint
  - Video generation provider: fal.ai (`fal-ai/wan/v2.2-5b/image-to-video`)
  - Image→video pipeline: generate still with OpenAI `gpt-image-1`, re-host that image to fal storage, then submit to fal.ai Wan queue

## Configuration

- Secrets come from environment variables (`.env`), never hardcoded
- Current AI env vars:
  - `OPENAI_API_KEY` for OpenAI image generation
  - `OPENAI_IMAGE_MODEL` optional override (defaults to `gpt-image-1`)
  - `FAL_API_KEY` for fal.ai image/video operations
  - `FAL_IMAGE_MODEL` optional override for fallback image generation model
  - `FAL_VIDEO_MODEL` optional override for video model
  - `IMAGE_BACKEND` rollout switch (`openai`, `fal`, `rollout`)
  - `GPT_IMAGE_PERCENTAGE` percentage routing for OpenAI when `IMAGE_BACKEND=rollout`
  - `IMAGE_RATE_LIMIT_PER_MINUTE` per-client short-window cap for image submit
  - `IMAGE_RATE_LIMIT_PER_DAY` per-client daily cap for image submit
  - `OPENAI_IMAGE_CONCURRENCY_LIMIT` global in-flight cap for OpenAI image calls
  - `OPENAI_IMAGE_COST_USD` estimated USD cost recorded per OpenAI image request

## Database

- ORM: Prisma (`backend/prisma`)
- Commands:
  - Generate client: `npm run db:generate`
  - Dev migration: `npm run db:migrate`
  - Deploy migration: `npm run db:migrate:deploy`

## AI Cost Telemetry

- Persist per-request image telemetry in `generation_costs` table (provider/model/size/quality/cost/client key).
- Admin summary routes:
  - `GET /ai/admin/costs/daily?day=YYYY-MM-DD`
  - `GET /ai/admin/costs/clients?day=YYYY-MM-DD`


## OpenAI Credentials

- Deployment requirement: `OPENAI_API_KEY` must be present in runtime secrets (backend fails fast on startup if missing).
- Ensure the OpenAI project key has Images API access enabled for `gpt-image-1`.
