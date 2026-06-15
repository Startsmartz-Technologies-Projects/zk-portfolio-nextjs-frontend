-- CreateTable
CREATE TABLE "news_stories" (
    "id" UUID NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "legacy_id" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "cover_image" UUID,
    "category_id" UUID,
    "tags" TEXT[],
    "article_date" DATE,
    "read_time_minutes" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "body_lead" TEXT,
    "body" JSONB,
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

    CONSTRAINT "news_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_gallery_items" (
    "id" UUID NOT NULL,
    "story_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "caption" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "news_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_stories_legacy_id_key" ON "news_stories"("legacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_stories_slug_key" ON "news_stories"("slug");

-- CreateIndex
CREATE INDEX "news_stories_status_idx" ON "news_stories"("status");

-- CreateIndex
CREATE INDEX "news_stories_category_id_idx" ON "news_stories"("category_id");

-- CreateIndex
CREATE INDEX "news_stories_featured_idx" ON "news_stories"("featured");

-- CreateIndex
CREATE INDEX "news_stories_article_date_idx" ON "news_stories"("article_date");

-- CreateIndex
CREATE INDEX "news_stories_deleted_at_idx" ON "news_stories"("deleted_at");

-- CreateIndex
CREATE INDEX "news_gallery_items_story_id_idx" ON "news_gallery_items"("story_id");

-- CreateIndex
CREATE INDEX "news_gallery_items_media_id_idx" ON "news_gallery_items"("media_id");

-- AddForeignKey
ALTER TABLE "news_stories" ADD CONSTRAINT "news_stories_cover_image_fkey" FOREIGN KEY ("cover_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_stories" ADD CONSTRAINT "news_stories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "taxonomy_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_stories" ADD CONSTRAINT "news_stories_seo_og_image_fkey" FOREIGN KEY ("seo_og_image") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_stories" ADD CONSTRAINT "news_stories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_stories" ADD CONSTRAINT "news_stories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_gallery_items" ADD CONSTRAINT "news_gallery_items_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "news_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_gallery_items" ADD CONSTRAINT "news_gallery_items_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

