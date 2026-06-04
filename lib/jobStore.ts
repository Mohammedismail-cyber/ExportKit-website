type JobStatus = "running" | "done" | "error";

export type JobEvent =
  | { type: "log"; message: string }
  | { type: "done"; downloadUrl: string; pageCount: number; assetCount: number }
  | { type: "error"; message: string };

export type ExportJob = {
  id: string;
  status: JobStatus;
  logs: string[];
  downloadUrl?: string;
  pageCount?: number;
  assetCount?: number;
  error?: string;
  listeners: Set<(event: JobEvent) => void>;
};

const globalStore = globalThis as typeof globalThis & {
  exportKitJobs?: Map<string, ExportJob>;
};

export const jobs = globalStore.exportKitJobs ?? new Map<string, ExportJob>();
globalStore.exportKitJobs = jobs;

export function createJob(id: string) {
  const job: ExportJob = {
    id,
    status: "running",
    logs: [],
    listeners: new Set()
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string) {
  return jobs.get(id);
}

export function appendLog(job: ExportJob, message: string) {
  job.logs.push(message);
  emit(job, { type: "log", message });
}

export function finishJob(job: ExportJob, result: { downloadUrl: string; pageCount: number; assetCount: number }) {
  job.status = "done";
  job.downloadUrl = result.downloadUrl;
  job.pageCount = result.pageCount;
  job.assetCount = result.assetCount;
  emit(job, { type: "done", ...result });
}

export function failJob(job: ExportJob, message: string) {
  job.status = "error";
  job.error = message;
  emit(job, { type: "error", message });
}

export function subscribe(job: ExportJob, listener: (event: JobEvent) => void) {
  job.listeners.add(listener);
  for (const message of job.logs) listener({ type: "log", message });

  if (job.status === "done" && job.downloadUrl && job.pageCount !== undefined && job.assetCount !== undefined) {
    listener({
      type: "done",
      downloadUrl: job.downloadUrl,
      pageCount: job.pageCount,
      assetCount: job.assetCount
    });
  }

  if (job.status === "error" && job.error) {
    listener({ type: "error", message: job.error });
  }

  return () => job.listeners.delete(listener);
}

function emit(job: ExportJob, event: JobEvent) {
  for (const listener of job.listeners) listener(event);
}
