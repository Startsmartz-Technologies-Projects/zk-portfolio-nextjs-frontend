import type { ProjectRecord } from "@/src/data/projects-data";

export async function fetchProjects(signal?: AbortSignal): Promise<ProjectRecord[]> {
  const response = await fetch("/api/projects", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }

  return (await response.json()) as ProjectRecord[];
}
