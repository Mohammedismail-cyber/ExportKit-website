import fs from "fs-extra";
import path from "path";
import { chromium } from "playwright";

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const outputDir = path.join(process.cwd(), "public", "screenshots");

const pages = [
  { path: "/", file: "home.png" },
  { path: "/about", file: "about.png" },
  { path: "/how-it-works", file: "how-it-works.png" },
  { path: "/pricing", file: "pricing.png" },
  { path: "/contact", file: "contact.png" }
];

async function main() {
  await fs.ensureDir(outputDir);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  for (const item of pages) {
    await page.goto(`${baseUrl}${item.path}`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(outputDir, item.file),
      fullPage: true
    });
  }

  await browser.close();
  console.log(`Saved ${pages.length} screenshots to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
