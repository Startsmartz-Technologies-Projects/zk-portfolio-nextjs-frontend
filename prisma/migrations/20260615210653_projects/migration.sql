-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('Government', 'Commercial', 'Private');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('Completed', 'Ongoing', 'Planning');

-- CreateEnum
CREATE TYPE "BadgeStyle" AS ENUM ('default', 'lime', 'black', 'gold');

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "legacy_id" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "category_id" UUID,
    "client_type" "ClientType",
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'Completed',
    "location_id" UUID,
    "location_detail" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "cover_image" UUID,
    "badge_text" TEXT,
    "badge_style" "BadgeStyle" NOT NULL DEFAULT 'default',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_order" INTEGER,
    "overview_title" TEXT,
    "overview_body" TEXT,
    "pull_quote" TEXT,
    "client" TEXT,
    "services_delivered" TEXT[],
    "scope_description" TEXT,
    "gallery_heading" TEXT,
    "gallery_description" TEXT,
    "highlights_description" TEXT,
    "case_study_challenge" TEXT,
    "case_study_approach" TEXT,
    "case_study_result" TEXT,
    "cta_heading" TEXT,
    "seo_meta_title" TEXT,
    "seo_meta_description" TEXT,
    "seo_canonical_url" TEXT,
    "seo_og_image" UUID,
    "seo_og_title" TEXT,
    "seo_og_description" TEXT,
    "seo_noindex" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_scopes" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "icon" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_highlights" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "unit" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_gallery_items" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "caption" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_related_items" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "related_project_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_related_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_legacy_id_key" ON "projects"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_category_id_idx" ON "projects"("category_id");

-- CreateIndex
CREATE INDEX "projects_location_id_idx" ON "projects"("location_id");

-- CreateIndex
CREATE INDEX "projects_client_type_idx" ON "projects"("client_type");

-- CreateIndex
CREATE INDEX "projects_delivery_status_idx" ON "projects"("delivery_status");

-- CreateIndex
CREATE INDEX "projects_featured_featured_order_idx" ON "projects"("featured", "featured_order");

-- CreateIndex
CREATE INDEX "projects_deleted_at_idx" ON "projects"("deleted_at");

-- CreateIndex
CREATE INDEX "project_scopes_project_id_idx" ON "project_scopes"("project_id");

-- CreateIndex
CREATE INDEX "project_highlights_project_id_idx" ON "project_highlights"("project_id");

-- CreateIndex
CREATE INDEX "project_gallery_items_project_id_idx" ON "project_gallery_items"("project_id");

-- CreateIndex
CREATE INDEX "project_gallery_items_media_id_idx" ON "project_gallery_items"("media_id");

-- CreateIndex
CREATE INDEX "project_related_items_project_id_idx" ON "project_related_items"("project_id");

-- CreateIndex
CREATE INDEX "project_related_items_related_project_id_idx" ON "project_related_items"("related_project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_related_items_project_id_related_project_id_key" ON "project_related_items"("project_id", "related_project_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "taxonomy_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "taxonomy_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_image_fkey" FOREIGN KEY ("cover_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_og_image_fkey" FOREIGN KEY ("seo_og_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_scopes" ADD CONSTRAINT "project_scopes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_highlights" ADD CONSTRAINT "project_highlights_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_related_items" ADD CONSTRAINT "project_related_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_related_items" ADD CONSTRAINT "project_related_items_related_project_id_fkey" FOREIGN KEY ("related_project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

