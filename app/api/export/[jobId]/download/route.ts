import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  if (!/^[a-f0-9-]{36}$/i.test(params.jobId)) {
    return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
  }

  const zipPath = path.join(process.cwd(), "tmp", "jobs", params.jobId, "export.zip");
  if (!(await fs.pathExists(zipPath))) {
    return NextResponse.json({ error: "Export not found." }, { status: 404 });
  }

  const file = await fs.readFile(zipPath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="exportkit-site.zip"',
      "Cache-Control": "no-store"
    }
  });
}
