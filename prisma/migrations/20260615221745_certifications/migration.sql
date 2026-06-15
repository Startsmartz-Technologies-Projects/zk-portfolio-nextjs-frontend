-- CreateEnum
CREATE TYPE "CertStatus" AS ENUM ('Active', 'Completed', 'Expired', 'Renewed');

-- CreateEnum
CREATE TYPE "CertTone" AS ENUM ('paper', 'slate', 'cream');

-- CreateEnum
CREATE TYPE "CertSealShape" AS ENUM ('round', 'hex');

-- CreateTable
CREATE TABLE "certifications" (
    "id" UUID NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "legacy_ref" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authority" TEXT,
    "number" TEXT,
    "category_id" UUID,
    "cert_status" "CertStatus" NOT NULL DEFAULT 'Active',
    "issued_date" DATE,
    "expiry_date" DATE,
    "description" TEXT,
    "document" UUID,
    "tone" "CertTone" NOT NULL DEFAULT 'paper',
    "seal_shape" "CertSealShape" NOT NULL DEFAULT 'round',
    "show_on_home" BOOLEAN NOT NULL DEFAULT false,
    "seal_label" TEXT,
    "seal_id" TEXT,
    "seal_validity" TEXT,
    "seal_order" INTEGER,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certifications_slug_key" ON "certifications"("slug");

-- CreateIndex
CREATE INDEX "certifications_status_idx" ON "certifications"("status");

-- CreateIndex
CREATE INDEX "certifications_category_id_idx" ON "certifications"("category_id");

-- CreateIndex
CREATE INDEX "certifications_cert_status_idx" ON "certifications"("cert_status");

-- CreateIndex
CREATE INDEX "certifications_show_on_home_seal_order_idx" ON "certifications"("show_on_home", "seal_order");

-- CreateIndex
CREATE INDEX "certifications_deleted_at_idx" ON "certifications"("deleted_at");

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "taxonomy_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_document_fkey" FOREIGN KEY ("document") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

