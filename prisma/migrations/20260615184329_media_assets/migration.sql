-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('image', 'document');

-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('cloudinary');

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "resource_type" "ResourceType" NOT NULL,
    "provider" "MediaProvider" NOT NULL DEFAULT 'cloudinary',
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" TEXT,
    "title" TEXT,
    "original_filename" TEXT,
    "tags" TEXT[],
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_assets_resource_type_idx" ON "media_assets"("resource_type");

-- CreateIndex
CREATE INDEX "media_assets_format_idx" ON "media_assets"("format");

-- CreateIndex
CREATE INDEX "media_assets_created_at_idx" ON "media_assets"("created_at");

-- CreateIndex
CREATE INDEX "media_assets_tags_idx" ON "media_assets" USING GIN ("tags");

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

