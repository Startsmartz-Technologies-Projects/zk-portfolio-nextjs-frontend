import { BlogDetailPageContent } from "@/src/components/blog-detail-page-content";

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <BlogDetailPageContent id={id} />
    </>
  );
}
