import { Nav } from "@/src/components/nav";
import { Footer } from "@/src/components/footer";
import { ConcernDetailPageContent } from "@/src/components/concern-detail-page-content";

export default async function ConcernDetailByIdPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams =
    typeof (params as Promise<{ id: string }>)?.then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
  const concernId = decodeURIComponent(resolvedParams.id);

  return (
    <>
      <Nav />
      <ConcernDetailPageContent concernId={concernId} />
      <Footer />
    </>
  );
}
