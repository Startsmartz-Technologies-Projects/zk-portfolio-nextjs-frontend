-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "legacy_id" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "icon" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "hero_image" UUID,
    "machine_image" UUID,
    "cta_image" UUID,
    "overview_title" TEXT,
    "overview_lead" TEXT,
    "overview_body" TEXT[],
    "overview_bullets" TEXT[],
    "scope_title" TEXT,
    "scope_lead" TEXT,
    "process_title" TEXT,
    "process_lead" TEXT,
    "benefits_title" TEXT,
    "benefits_lead" TEXT,
    "capability_title" TEXT,
    "capability_lead" TEXT,
    "capability_body_title" TEXT,
    "capability_body_desc" TEXT,
    "faq_title" TEXT,
    "faq_lead" TEXT,
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

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_meta_items" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_meta_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_scope_items" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_scope_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_process_items" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "tag" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_process_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_benefit_items" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_benefit_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_machine_items" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_machine_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_faq_items" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_legacy_id_key" ON "services"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_status_idx" ON "services"("status");

-- CreateIndex
CREATE INDEX "services_position_idx" ON "services"("position");

-- CreateIndex
CREATE INDEX "services_deleted_at_idx" ON "services"("deleted_at");

-- CreateIndex
CREATE INDEX "service_meta_items_service_id_idx" ON "service_meta_items"("service_id");

-- CreateIndex
CREATE INDEX "service_scope_items_service_id_idx" ON "service_scope_items"("service_id");

-- CreateIndex
CREATE INDEX "service_process_items_service_id_idx" ON "service_process_items"("service_id");

-- CreateIndex
CREATE INDEX "service_benefit_items_service_id_idx" ON "service_benefit_items"("service_id");

-- CreateIndex
CREATE INDEX "service_machine_items_service_id_idx" ON "service_machine_items"("service_id");

-- CreateIndex
CREATE INDEX "service_faq_items_service_id_idx" ON "service_faq_items"("service_id");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_hero_image_fkey" FOREIGN KEY ("hero_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_machine_image_fkey" FOREIGN KEY ("machine_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_cta_image_fkey" FOREIGN KEY ("cta_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_seo_og_image_fkey" FOREIGN KEY ("seo_og_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_meta_items" ADD CONSTRAINT "service_meta_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_scope_items" ADD CONSTRAINT "service_scope_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_process_items" ADD CONSTRAINT "service_process_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_benefit_items" ADD CONSTRAINT "service_benefit_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_machine_items" ADD CONSTRAINT "service_machine_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_faq_items" ADD CONSTRAINT "service_faq_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

