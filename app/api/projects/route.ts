import { NextResponse } from "next/server";
import { PROJECTS } from "@/src/data/projects-data";

export async function GET() {
  return NextResponse.json(PROJECTS);
}
