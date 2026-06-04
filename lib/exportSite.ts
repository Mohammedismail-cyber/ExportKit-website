import crypto from "node:crypto";
import path from "node:path";
import fs from "fs-extra";
import { crawlSite } from "./crawler";
import { downloadAssets } from "./assetDownloader";
import { rewriteAndWritePages } from "./linkRewriter";
import { zipDirectory } from "./zipper";

export type ExportJobResult = {
  jobId: string;
  jobDir: string;
  exportDir: string;
  zipPath: string;
  pageCount: number;
  assetCount: number;
  logs: string[];
};

type ExportSiteOptions = {
  jobId?: string;
  onProgress?: (message: string) => void;
};

export async function exportSite(url: string, options: ExportSiteOptions = {}): Promise<ExportJobResult> {
  const jobId = options.jobId ?? crypto.randomUUID();
  const jobDir = path.join(process.cwd(), "tmp", "jobs", jobId);
  const exportDir = path.join(jobDir, "export");
  const zipPath = path.join(jobDir, "export.zip");
  const logs: string[] = [];
  const log = (message: string) => {
    logs.push(message);
    options.onProgress?.(message);
  };

  await fs.emptyDir(exportDir);

  const crawl = await crawlSite(url, {
    maxPages: 20,
    maxDepth: 3,
    pageTimeoutMs: 30_000,
    totalTimeoutMs: 120_000,
    onProgress: log
  });

  log("$ downloading assets...");
  const assetMap = await downloadAssets(crawl, exportDir, log);

  log("$ rewriting links...");
  await rewriteAndWritePages(crawl, exportDir, assetMap, log);

  log("$ packaging zip...");
  await zipDirectory(exportDir, zipPath);
  log("$ ready to download ✓");

  return {
    jobId,
    jobDir,
    exportDir,
    zipPath,
    pageCount: crawl.pages.length,
    assetCount: assetMap.size,
    logs
  };
}
