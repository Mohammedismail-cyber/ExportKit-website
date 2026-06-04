export type ProgressLogger = (message: string) => void;

export type CrawledPage = {
  url: string;
  pathname: string;
  html: string;
  title: string;
};

export type CrawlResult = {
  origin: string;
  rootUrl: string;
  pages: CrawledPage[];
};

export type AssetMap = Map<string, string>;
