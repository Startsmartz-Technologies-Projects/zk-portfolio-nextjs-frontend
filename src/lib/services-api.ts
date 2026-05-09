import type { ServiceRecord } from "@/src/data/services-data";

export async function fetchServices(signal?: AbortSignal): Promise<ServiceRecord[]> {
  const response = await fetch("/api/services", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch services: ${response.status}`);
  }

  return (await response.json()) as ServiceRecord[];
}

export async function fetchServiceBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<ServiceRecord> {
  const response = await fetch(`/api/services?slug=${encodeURIComponent(slug)}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch service '${slug}': ${response.status}`);
  }

  return (await response.json()) as ServiceRecord;
}
