import { ProjectDetailContent } from "@/src/components/project-detail-content";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams =
    typeof (params as Promise<{ id: string }>)?.then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
  const projectId = decodeURIComponent(resolvedParams.id);

  return (
    <>
      <ProjectDetailContent projectId={projectId} />
    </>
  );
}
