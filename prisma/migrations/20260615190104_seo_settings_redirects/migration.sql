-- CreateEnum
CREATE TYPE "RobotsPolicy" AS ENUM ('index_follow', 'noindex_nofollow', 'custom');

-- CreateEnum
CREATE TYPE "RedirectStatus" AS ENUM ('301', '302');

-- CreateEnum
CREATE TYPE "RedirectSource" AS ENUM ('system', 'manual');

-- CreateTable
CREATE TABLE "seo_settings" (
    "id" UUID NOT NULL,
    "site_title_template" TEXT NOT NULL,
    "default_meta_description" TEXT NOT NULL,
    "metadata_base" TEXT NOT NULL,
    "default_og_image" UUID,
    "twitter_handle" TEXT,
    "default_robots" "RobotsPolicy" NOT NULL DEFAULT 'index_follow',
    "google_site_verification" TEXT,
    "bing_site_verification" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redirects" (
    "id" UUID NOT NULL,
    "from_path" TEXT NOT NULL,
    "to_path" TEXT NOT NULL,
    "status" "RedirectStatus" NOT NULL DEFAULT '301',
    "source" "RedirectSource" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redirects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "redirects_from_path_key" ON "redirects"("from_path");

-- AddForeignKey
ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_default_og_image_fkey" FOREIGN KEY ("default_og_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redirects" ADD CONSTRAINT "redirects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redirects" ADD CONSTRAINT "redirects_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

