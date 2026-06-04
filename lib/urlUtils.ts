import crypto from "node:crypto";
import path from "node:path";

const fallbackExtensions: Record<string, string> = {
  "text/css": ".css",
  "application/javascript": ".js",
  "text/javascript": ".js",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "font/woff": ".woff",
  "font/woff2": ".woff2"
};

export function normalizeUrl(input: string, base?: string) {
  try {
    const url = new URL(input, base);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export function withoutHash(input: string) {
  const hashIndex = input.indexOf("#");
  return hashIndex >= 0 ? input.slice(0, hashIndex) : input;
}

export function toPageFilename(pageUrl: string, rootUrl: string) {
  const url = new URL(pageUrl);
  const root = new URL(rootUrl);
  const pathname = cleanPathname(url.pathname);

  if (url.origin === root.origin && cleanPathname(root.pathname) === pathname) {
    return "index.html";
  }

  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return "index.html";
  return `${sanitizeSegment(trimmed.replaceAll("/", "-"))}.html`;
}

export function assetFilename(assetUrl: string, contentType?: string) {
  const url = new URL(assetUrl);
  const hash = crypto.createHash("sha1").update(assetUrl).digest("hex").slice(0, 10);
  const parsed = path.posix.parse(url.pathname);
  const rawName = parsed.name || "asset";
  const ext = parsed.ext || fallbackExtensions[(contentType || "").split(";")[0].trim()] || ".bin";
  return `${sanitizeSegment(rawName)}-${hash}${ext}`;
}

export function cleanPathname(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function sanitizeSegment(value: string) {
  return value
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
}
