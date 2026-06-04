import fs from "fs-extra";
import path from "node:path";
import axios from "axios";
import * as cheerio from "cheerio";
import type { AssetMap, CrawlResult, ProgressLogger } from "./types";
import { assetFilename, normalizeUrl } from "./urlUtils";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

const URL_PATTERN = /url\((['"]?)(.*?)\1\)/gi;

export async function downloadAssets(
  crawl: CrawlResult,
  exportDir: string,
  onProgress: ProgressLogger = () => undefined
) {
  const assetsDir = path.join(exportDir, "assets");
  await fs.ensureDir(assetsDir);

  const assetUrls = new Set<string>();
  const cssAssets: Array<{ sourceUrl: string; localPath: string }> = [];

  for (const crawledPage of crawl.pages) {
    const $ = cheerio.load(crawledPage.html);
    collectAttribute($, crawledPage.url, assetUrls, "link[href]", "href");
    collectAttribute($, crawledPage.url, assetUrls, "script[src]", "src");
    collectAttribute($, crawledPage.url, assetUrls, "img[src]", "src");
    collectAttribute($, crawledPage.url, assetUrls, "source[src]", "src");
    collectAttribute($, crawledPage.url, assetUrls, "source[srcset]", "srcset");
    collectAttribute($, crawledPage.url, assetUrls, "img[srcset]", "srcset");
    collectAttribute($, crawledPage.url, assetUrls, "video[src]", "src");
    collectAttribute($, crawledPage.url, assetUrls, "audio[src]", "src");
  }

  const assetMap: AssetMap = new Map();
  onProgress(`$ discovered ${assetUrls.size} asset references`);

  for (const assetUrl of assetUrls) {
    if (assetMap.has(assetUrl)) continue;

    try {
      const response = await axios.get<ArrayBuffer>(assetUrl, {
        responseType: "arraybuffer",
        timeout: 30_000,
        headers: { "User-Agent": USER_AGENT },
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });

      if (response.status >= 400) {
        onProgress(`$ skipped asset ${assetUrl} (${response.status})`);
        continue;
      }

      const contentTypeHeader = response.headers["content-type"];
      const contentType = typeof contentTypeHeader === "string" ? contentTypeHeader : undefined;
      const filename = assetFilename(assetUrl, contentType);
      const relativePath = `assets/${filename}`;
      const absolutePath = path.join(exportDir, relativePath);
      await fs.writeFile(absolutePath, Buffer.from(response.data));
      assetMap.set(assetUrl, relativePath);
      onProgress(`$ downloaded asset ${assetMap.size}: ${filename}`);

      if (filename.endsWith(".css")) {
        cssAssets.push({ sourceUrl: assetUrl, localPath: absolutePath });
        await collectCssUrls(Buffer.from(response.data).toString("utf8"), assetUrl, assetUrls);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      onProgress(`$ skipped asset ${assetUrl}: ${message}`);
    }
  }

  for (const cssAsset of cssAssets) {
    const css = await fs.readFile(cssAsset.localPath, "utf8");
    const rewritten = css.replace(URL_PATTERN, (fullMatch, quote: string, rawUrl: string) => {
      if (rawUrl.startsWith("data:") || rawUrl.startsWith("blob:")) return fullMatch;
      const resolved = normalizeUrl(rawUrl, cssAsset.sourceUrl);
      if (!resolved) return fullMatch;
      const localAsset = assetMap.get(resolved.href);
      if (!localAsset) return fullMatch;
      const relativeFromCss = path.posix.relative("assets", localAsset).replaceAll("\\", "/");
      return `url(${quote}${relativeFromCss}${quote})`;
    });
    await fs.writeFile(cssAsset.localPath, rewritten);
  }

  return assetMap;
}

function collectAttribute(
  $: cheerio.CheerioAPI,
  baseUrl: string,
  target: Set<string>,
  selector: string,
  attribute: string
) {
  $(selector).each((_, element) => {
    const value = $(element).attr(attribute);
    if (!value) return;

    if (attribute === "srcset") {
      for (const srcsetUrl of parseSrcset(value)) {
        addAssetUrl(srcsetUrl, baseUrl, target);
      }
      return;
    }

    addAssetUrl(value, baseUrl, target);
  });
}

function addAssetUrl(value: string, baseUrl: string, target: Set<string>) {
  if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("mailto:")) return;
  const resolved = normalizeUrl(value, baseUrl);
  if (resolved) target.add(resolved.href);
}

async function collectCssUrls(css: string, baseUrl: string, target: Set<string>) {
  let match: RegExpExecArray | null;
  while ((match = URL_PATTERN.exec(css)) !== null) {
    addAssetUrl(match[2], baseUrl, target);
  }
}

function parseSrcset(srcset: string) {
  return srcset
    .split(",")
    .map((entry) => entry.trim().split(/\s+/)[0])
    .filter(Boolean);
}
