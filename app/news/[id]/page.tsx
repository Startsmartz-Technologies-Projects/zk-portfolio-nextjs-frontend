import { NewsDetailPageContent } from "@/src/components/news-page-content";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <NewsDetailPageContent itemId={id} />
    </>
  );
}
