import { crawlSite } from "../lib/crawler";

const url = process.argv[2] || "https://example.com";

async function main() {
  const result = await crawlSite(url, {
    maxPages: 3,
    maxDepth: 1,
    onProgress: (message) => console.log(message)
  });

  console.log({
    origin: result.origin,
    pages: result.pages.map((page) => ({ url: page.url, title: page.title }))
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
