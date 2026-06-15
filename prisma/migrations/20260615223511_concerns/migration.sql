-- CreateTable
CREATE TABLE "concerns" (
    "id" UUID NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "legacy_id" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short" TEXT,
    "tagline" TEXT,
    "intro" TEXT,
    "established_year" INTEGER,
    "code" TEXT,
    "hero_image" UUID,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "overview_title" TEXT,
    "overview_body" TEXT[],
    "overview_mission" TEXT,
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

    CONSTRAINT "concerns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concern_facts" (
    "id" UUID NOT NULL,
    "concern_id" UUID NOT NULL,
    "big" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sub" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "concern_facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concern_services" (
    "id" UUID NOT NULL,
    "concern_id" UUID NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "copy" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "concern_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concern_why" (
    "id" UUID NOT NULL,
    "concern_id" UUID NOT NULL,
    "number" TEXT,
    "title" TEXT NOT NULL,
    "copy" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "concern_why_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concern_showcase_projects" (
    "id" UUID NOT NULL,
    "concern_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "category" TEXT,
    "summary" TEXT,
    "image" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "concern_showcase_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concern_process_steps" (
    "id" UUID NOT NULL,
    "concern_id" UUID NOT NULL,
    "step" TEXT,
    "title" TEXT NOT NULL,
    "copy" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "concern_process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concern_gallery_items" (
    "id" UUID NOT NULL,
    "concern_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "caption" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "concern_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concern_faqs" (
    "id" UUID NOT NULL,
    "concern_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "concern_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "concerns_legacy_id_key" ON "concerns"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "concerns_slug_key" ON "concerns"("slug");

-- CreateIndex
CREATE INDEX "concerns_status_idx" ON "concerns"("status");

-- CreateIndex
CREATE INDEX "concerns_position_idx" ON "concerns"("position");

-- CreateIndex
CREATE INDEX "concerns_is_default_idx" ON "concerns"("is_default");

-- CreateIndex
CREATE INDEX "concerns_deleted_at_idx" ON "concerns"("deleted_at");

-- CreateIndex
CREATE INDEX "concern_facts_concern_id_idx" ON "concern_facts"("concern_id");

-- CreateIndex
CREATE INDEX "concern_services_concern_id_idx" ON "concern_services"("concern_id");

-- CreateIndex
CREATE INDEX "concern_why_concern_id_idx" ON "concern_why"("concern_id");

-- CreateIndex
CREATE INDEX "concern_showcase_projects_concern_id_idx" ON "concern_showcase_projects"("concern_id");

-- CreateIndex
CREATE INDEX "concern_showcase_projects_image_idx" ON "concern_showcase_projects"("image");

-- CreateIndex
CREATE INDEX "concern_process_steps_concern_id_idx" ON "concern_process_steps"("concern_id");

-- CreateIndex
CREATE INDEX "concern_gallery_items_concern_id_idx" ON "concern_gallery_items"("concern_id");

-- CreateIndex
CREATE INDEX "concern_gallery_items_media_id_idx" ON "concern_gallery_items"("media_id");

-- CreateIndex
CREATE INDEX "concern_faqs_concern_id_idx" ON "concern_faqs"("concern_id");

-- AddForeignKey
ALTER TABLE "concerns" ADD CONSTRAINT "concerns_hero_image_fkey" FOREIGN KEY ("hero_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concerns" ADD CONSTRAINT "concerns_seo_og_image_fkey" FOREIGN KEY ("seo_og_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concerns" ADD CONSTRAINT "concerns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concerns" ADD CONSTRAINT "concerns_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concern_facts" ADD CONSTRAINT "concern_facts_concern_id_fkey" FOREIGN KEY ("concern_id") REFERENCES "concerns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concern_services" ADD CONSTRAINT "concern_services_concern_id_fkey" FOREIGN KEY ("concern_id") REFERENCES "concerns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concern_why" ADD CONSTRAINT "concern_why_concern_id_fkey" FOREIGN KEY ("concern_id") REFERENCES "concerns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concern_showcase_projects" ADD CONSTRAINT "concern_showcase_projects_concern_id_fkey" FOREIGN KEY ("concern_id") REFERENCES "concerns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concern_showcase_projects" ADD CONSTRAINT "concern_showcase_projects_image_fkey" FOREIGN KEY ("image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concern_process_steps" ADD CONSTRAINT "concern_process_steps_concern_id_fkey" FOREIGN KEY ("concern_id") REFERENCES "concerns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concern_gallery_items" ADD CONSTRAINT "concern_gallery_items_concern_id_fkey" FOREIGN KEY ("concern_id") REFERENCES "concerns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concern_gallery_items" ADD CONSTRAINT "concern_gallery_items_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concern_faqs" ADD CONSTRAINT "concern_faqs_concern_id_fkey" FOREIGN KEY ("concern_id") REFERENCES "concerns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

