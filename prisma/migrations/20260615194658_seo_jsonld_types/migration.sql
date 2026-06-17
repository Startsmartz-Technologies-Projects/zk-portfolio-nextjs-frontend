-- AlterTable
ALTER TABLE "seo_settings" ADD COLUMN     "jsonld_types" TEXT[] DEFAULT ARRAY['Organization', 'Article', 'NewsArticle', 'Service', 'FAQPage', 'BreadcrumbList']::TEXT[];

