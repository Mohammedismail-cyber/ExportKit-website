import { chromium } from "playwright";
import type { CrawlResult, CrawledPage, ProgressLogger } from "./types";
import { cleanPathname, normalizeUrl } from "./urlUtils";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

type CrawlOptions = {
  maxDepth?: number;
  maxPages?: number;
  pageTimeoutMs?: number;
  totalTimeoutMs?: number;
  onProgress?: ProgressLogger;
};

export async function crawlSite(inputUrl: string, options: CrawlOptions = {}): Promise<CrawlResult> {
  const startUrl = normalizeUrl(inputUrl);
  if (!startUrl) throw new Error("Enter a valid public http or https URL.");

  const maxDepth = options.maxDepth ?? 3;
  const maxPages = options.maxPages ?? 20;
  const pageTimeoutMs = options.pageTimeoutMs ?? 30_000;
  const totalTimeoutMs = options.totalTimeoutMs ?? 120_000;
  const startedAt = Date.now();
  const log = options.onProgress ?? (() => undefined);

  log("$ launching browser...");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1440, height: 1200 }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(pageTimeoutMs);
  page.setDefaultNavigationTimeout(pageTimeoutMs);

  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl.href, depth: 0 }];
  const visited = new Set<string>();
  const queued = new Set<string>([startUrl.href]);
  const pages: CrawledPage[] = [];

  try {
    while (queue.length > 0 && pages.length < maxPages) {
      if (Date.now() - startedAt > totalTimeoutMs) {
        log("$ total timeout reached; packaging pages crawled so far");
        break;
      }

      const next = queue.shift();
      if (!next || visited.has(next.url)) continue;

      visited.add(next.url);
      log(`$ crawling ${next.url}`);

      try {
        const response = await page.goto(next.url, {
          waitUntil: "domcontentloaded",
          timeout: pageTimeoutMs
        });

        if (response && response.status() >= 400) {
          log(`$ skipped ${next.url} (${response.status()})`);
          continue;
        }

        await page.waitForLoadState("networkidle", { timeout: pageTimeoutMs }).catch(() => {
          log("$ network idle timeout; capturing current rendered page");
        });

        const html = await page.content();
        const title = await page.title().catch(() => "");
        const currentUrl = page.url();
        pages.push({
          url: currentUrl,
          pathname: new URL(currentUrl).pathname,
          html,
          title
        });

        log(`$ captured page ${pages.length}/${maxPages}: ${cleanPathname(new URL(currentUrl).pathname)}`);

        if (next.depth >= maxDepth) continue;

        const links = await page.$$eval("a[href]", (anchors) =>
          anchors
            .map((anchor) => anchor.getAttribute("href") || "")
            .filter(Boolean)
        );

        for (const href of links) {
          const resolved = normalizeUrl(href, currentUrl);
          if (!resolved || resolved.origin !== startUrl.origin) continue;
          resolved.hash = "";
          const clean = resolved.href;
          if (queued.has(clean) || visited.has(clean)) continue;
          queued.add(clean);
          queue.push({ url: clean, depth: next.depth + 1 });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        log(`$ skipped ${next.url}: ${message}`);
      }
    }
  } finally {
    await browser.close();
  }

  if (pages.length === 0) {
    throw new Error("No pages could be captured from that URL.");
  }

  return {
    origin: startUrl.origin,
    rootUrl: startUrl.href,
    pages
  };
}
