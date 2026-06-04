"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { features, plans, steps } from "./site-data";

type ExportResponse = {
  jobId: string;
  eventsUrl: string;
};

type ExportEvent =
  | { type: "log"; message: string }
  | { type: "done"; downloadUrl: string; pageCount: number; assetCount: number }
  | { type: "error"; message: string };

const initialLogs = ["$ waiting for website URL", "$ exports are limited to same-origin public pages"];

export default function Home() {
  const [url, setUrl] = useState("");
  const [hasPermission, setHasPermission] = useState(false);
  const [logs, setLogs] = useState<string[]>(initialLogs);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return url.trim().length > 0 && hasPermission && !isExporting;
  }, [hasPermission, isExporting, url]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsExporting(true);
    setError("");
    setDownloadUrl("");
    setPageCount(0);
    setAssetCount(0);
    setLogs(["$ starting export job..."]);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() })
      });

      const payload = (await response.json()) as ExportResponse | { error: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Export failed");
      }

      await streamProgress((payload as ExportResponse).eventsUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";
      setError(message);
      setLogs((current) => [...current, `$ failed: ${message}`]);
    } finally {
      setIsExporting(false);
    }
  }

  function streamProgress(eventsUrl: string) {
    return new Promise<void>((resolve, reject) => {
      const events = new EventSource(eventsUrl);

      events.onmessage = (event) => {
        const data = JSON.parse(event.data) as ExportEvent;

        if (data.type === "log") {
          setLogs((current) => {
            if (current[current.length - 1] === data.message) return current;
            return [...current, data.message];
          });
          return;
        }

        if (data.type === "done") {
          setDownloadUrl(data.downloadUrl);
          setPageCount(data.pageCount);
          setAssetCount(data.assetCount);
          events.close();
          resolve();
          return;
        }

        events.close();
        reject(new Error(data.message));
      };

      events.onerror = () => {
        events.close();
        reject(new Error("Progress stream disconnected."));
      };
    });
  }

  return (
    <main>
      <section className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">
              Modern static exports
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
              Export public websites into clean static archives.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
              A focused black-and-white workflow for teams that need to preserve rendered pages,
              collect assets, and ship a downloadable ZIP without a heavy CMS handoff.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#export"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
              >
                Export a site
              </a>
              <Link
                href="/how-it-works"
                className="inline-flex h-11 items-center justify-center rounded-md border border-[hsl(var(--border))] px-5 text-sm font-medium transition hover:bg-[hsl(var(--muted))]"
              >
                See workflow
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 shadow-sm">
            <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3 text-xs text-[hsl(var(--muted-foreground))]">
                <span>export.preview</span>
                <span>{isExporting ? "running" : "ready"}</span>
              </div>
              <div className="grid gap-3 py-4 sm:grid-cols-2">
                <Metric label="pages" value={pageCount} />
                <Metric label="assets" value={assetCount} />
              </div>
              <div className="min-h-[220px] rounded-md bg-[hsl(var(--foreground))] p-4 font-mono text-sm text-[hsl(var(--background))]">
                {logs.map((line, index) => (
                  <p key={`${line}-${index}`} className="break-words leading-7">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="export" className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">
              Home
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              Start from the URL you already have.
            </h2>
            <p className="mt-4 leading-7 text-[hsl(var(--muted-foreground))]">
              The home workflow stays direct: paste, confirm permission, export, and download. It
              keeps the tool surface compact while the rest of the site explains the product.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5 shadow-sm"
          >
            <label htmlFor="url" className="text-sm font-medium">
              Website URL
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.framer.website"
                className="h-12 flex-1 rounded-md border border-[hsl(var(--input))] bg-transparent px-4 text-base outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              <button
                type="submit"
                disabled={!canSubmit}
                className="h-12 rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isExporting ? "Exporting..." : "Export site"}
              </button>
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm text-[hsl(var(--muted-foreground))]">
              <input
                type="checkbox"
                checked={hasPermission}
                onChange={(event) => setHasPermission(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[hsl(var(--foreground))]"
              />
              <span>I confirm I own or have permission to export this website.</span>
            </label>
            {error ? <p className="mt-4 text-sm font-medium">{error}</p> : null}
            {downloadUrl ? (
              <a
                href={downloadUrl}
                className="mt-5 inline-flex h-11 items-center rounded-md border border-[hsl(var(--border))] px-4 text-sm font-medium transition hover:bg-[hsl(var(--muted))]"
              >
                Download ZIP
              </a>
            ) : null}
          </form>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-[hsl(var(--border))] p-6">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-[hsl(var(--muted-foreground))]">{feature.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-[hsl(var(--border))] p-6">
            <h3 className="text-xl font-semibold">How it works</h3>
            <ol className="mt-5 space-y-3 text-[hsl(var(--muted-foreground))]">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="font-mono text-[hsl(var(--foreground))]">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] p-6">
            <h3 className="text-xl font-semibold">Pricing preview</h3>
            <div className="mt-5 grid gap-3">
              {plans.map((plan) => (
                <Link
                  key={plan.name}
                  href="/pricing"
                  className="flex items-center justify-between rounded-md border border-[hsl(var(--border))] p-4 transition hover:bg-[hsl(var(--muted))]"
                >
                  <span>{plan.name}</span>
                  <span className="font-semibold">{plan.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
      <div className="font-mono text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">{label}</div>
    </div>
  );
}
