import { NextRequest, NextResponse } from "next/server";
import { SERVICES, getServiceBySlug } from "@/src/data/services-data";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(SERVICES);
  }

  const service = getServiceBySlug(slug);

  if (!service) {
    return NextResponse.json({ message: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}
