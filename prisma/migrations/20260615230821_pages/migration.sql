-- CreateEnum
CREATE TYPE "PageKey" AS ENUM ('home', 'about', 'lets-collaborate', 'projects-index', 'services-index', 'blog-index', 'news-index', 'certifications-index');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('hero', 'expertise_cards', 'stat_strip', 'about_intro', 'featured_projects', 'featured_services', 'featured_certifications', 'logo_wall', 'testimonials', 'cta_banner', 'story', 'mvv', 'timeline', 'leadership_message', 'why_us', 'achievements', 'clients_filterable', 'final_cta', 'intent_cards', 'trust_hook', 'contact_panel', 'network_strip', 'insights_strip', 'news_strip', 'leadership_team', 'culture');

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "key" "PageKey" NOT NULL,
    "path" TEXT NOT NULL,
    "admin_title" TEXT NOT NULL,
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

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "type" "SectionType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "eyebrow" TEXT,
    "heading" TEXT,
    "subheading" TEXT,
    "body" TEXT,
    "variant" TEXT,
    "background_image" UUID,
    "cta_primary_label" TEXT,
    "cta_primary_url" TEXT,
    "cta_secondary_label" TEXT,
    "cta_secondary_url" TEXT,
    "max_items" INTEGER,
    "source_key" TEXT,
    "settings" JSONB,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_items" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "image" UUID,
    "tag" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "body" TEXT,
    "value" TEXT,
    "unit" TEXT,
    "stat_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "link_url" TEXT,
    "link_label" TEXT,
    "meta" JSONB,

    CONSTRAINT "section_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_key_key" ON "pages"("key");

-- CreateIndex
CREATE INDEX "pages_status_idx" ON "pages"("status");

-- CreateIndex
CREATE INDEX "page_sections_page_id_idx" ON "page_sections"("page_id");

-- CreateIndex
CREATE INDEX "section_items_section_id_idx" ON "section_items"("section_id");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_fkey" FOREIGN KEY ("seo_og_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_background_image_fkey" FOREIGN KEY ("background_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_items" ADD CONSTRAINT "section_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_items" ADD CONSTRAINT "section_items_image_fkey" FOREIGN KEY ("image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

