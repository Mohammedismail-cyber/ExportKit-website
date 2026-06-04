import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "fs-extra";
import { exportSite } from "@/lib/exportSite";
import { appendLog, createJob, failJob, finishJob } from "@/lib/jobStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string" || body.url.trim().length === 0) {
      return NextResponse.json({ error: "A website URL is required." }, { status: 400 });
    }

    const jobId = crypto.randomUUID();
    const job = createJob(jobId);

    void exportSite(body.url.trim(), {
      jobId,
      onProgress: (message) => appendLog(job, message)
    })
      .then((result) => {
        finishJob(job, {
          downloadUrl: `/api/export/${result.jobId}/download`,
          pageCount: result.pageCount,
          assetCount: result.assetCount
        });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Export failed.";
        failJob(job, message);
      });

    return NextResponse.json({
      jobId,
      eventsUrl: `/api/export/${jobId}/events`
    }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  await fs.ensureDir("tmp/jobs");
  return NextResponse.json({ status: "ready" });
}
