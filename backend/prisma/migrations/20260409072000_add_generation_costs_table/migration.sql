CREATE TABLE IF NOT EXISTS "generation_costs" (
  "id" TEXT PRIMARY KEY,
  "clientKey" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "quality" TEXT NOT NULL,
  "costUsd" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "generation_costs_createdAt_idx"
  ON "generation_costs"("createdAt");

CREATE INDEX IF NOT EXISTS "generation_costs_clientKey_createdAt_idx"
  ON "generation_costs"("clientKey", "createdAt");
