import fs from "fs-extra";
import path from "node:path";
import * as cheerio from "cheerio";
import type { AssetMap, CrawlResult, ProgressLogger } from "./types";
import { normalizeUrl, toPageFilename, withoutHash } from "./urlUtils";

export async function rewriteAndWritePages(
  crawl: CrawlResult,
  exportDir: string,
  assetMap: AssetMap,
  onProgress: ProgressLogger = () => undefined
) {
  const pageMap = new Map<string, string>();
  for (const page of crawl.pages) {
    pageMap.set(withoutHash(page.url), toPageFilename(page.url, crawl.rootUrl));
  }

  for (const crawledPage of crawl.pages) {
    const $ = cheerio.load(crawledPage.html);

    rewriteAttribute($, crawledPage.url, "link[href]", "href", assetMap, pageMap);
    rewriteAttribute($, crawledPage.url, "script[src]", "src", assetMap, pageMap);
    rewriteAttribute($, crawledPage.url, "img[src]", "src", assetMap, pageMap);
    rewriteAttribute($, crawledPage.url, "source[src]", "src", assetMap, pageMap);
    rewriteSrcset($, crawledPage.url, "img[srcset]", assetMap);
    rewriteSrcset($, crawledPage.url, "source[srcset]", assetMap);
    rewriteAttribute($, crawledPage.url, "video[src]", "src", assetMap, pageMap);
    rewriteAttribute($, crawledPage.url, "audio[src]", "src", assetMap, pageMap);

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      if (!href || href.startsWith("#")) return;
      const resolved = normalizeUrl(href, crawledPage.url);
      if (!resolved || resolved.origin !== crawl.origin) return;

      const hash = resolved.hash;
      resolved.hash = "";
      const filename = pageMap.get(resolved.href);
      if (filename) $(element).attr("href", `./${filename}${hash}`);
    });

    const filename = pageMap.get(withoutHash(crawledPage.url)) || toPageFilename(crawledPage.url, crawl.rootUrl);
    await fs.writeFile(path.join(exportDir, filename), $.html());
    onProgress(`$ wrote ${filename}`);
  }
}

function rewriteAttribute(
  $: cheerio.CheerioAPI,
  baseUrl: string,
  selector: string,
  attribute: string,
  assetMap: AssetMap,
  pageMap: Map<string, string>
) {
  $(selector).each((_, element) => {
    const value = $(element).attr(attribute);
    if (!value || value.startsWith("data:") || value.startsWith("blob:")) return;
    const resolved = normalizeUrl(value, baseUrl);
    if (!resolved) return;

    const assetPath = assetMap.get(resolved.href);
    if (assetPath) {
      $(element).attr(attribute, `./${assetPath.replaceAll("\\", "/")}`);
      return;
    }

    const pagePath = pageMap.get(withoutHash(resolved.href));
    if (pagePath) $(element).attr(attribute, `./${pagePath}`);
  });
}

function rewriteSrcset(
  $: cheerio.CheerioAPI,
  baseUrl: string,
  selector: string,
  assetMap: AssetMap
) {
  $(selector).each((_, element) => {
    const srcset = $(element).attr("srcset");
    if (!srcset) return;

    const rewritten = srcset
      .split(",")
      .map((entry) => {
        const parts = entry.trim().split(/\s+/);
        const resolved = normalizeUrl(parts[0], baseUrl);
        if (resolved) {
          const assetPath = assetMap.get(resolved.href);
          if (assetPath) parts[0] = `./${assetPath.replaceAll("\\", "/")}`;
        }
        return parts.join(" ");
      })
      .join(", ");

    $(element).attr("srcset", rewritten);
  });
}
