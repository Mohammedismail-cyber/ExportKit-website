import { NextRequest, NextResponse } from "next/server";
import { getJob, subscribe, type JobEvent } from "@/lib/jobStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  if (!/^[a-f0-9-]{36}$/i.test(params.jobId)) {
    return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
  }

  const job = getJob(params.jobId);
  if (!job) {
    return NextResponse.json({ error: "Export job not found." }, { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: JobEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      const unsubscribe = subscribe(job, send);
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
