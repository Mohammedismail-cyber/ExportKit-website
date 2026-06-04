import Link from "next/link";
import { steps } from "../site-data";

export default function HowItWorksPage() {
  return (
    <main>
      <section className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">
            How it works
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
            Four steps from public URL to static ZIP.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
            The workflow is intentionally short. It captures rendered pages, follows same-origin
            assets, and streams job progress while the archive is assembled.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step} className="rounded-lg border border-[hsl(var(--border))] p-6">
              <span className="font-mono text-sm text-[hsl(var(--muted-foreground))]">
                0{index + 1}
              </span>
              <h2 className="mt-6 text-xl font-semibold">{step}</h2>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-[hsl(var(--border))] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-normal">What the job checks</h2>
              <p className="mt-4 leading-7 text-[hsl(var(--muted-foreground))]">
                ExportKit validates the URL, starts a browser session, saves rendered HTML, collects
                same-origin assets, and reports counts before creating the ZIP download.
              </p>
            </div>
            <div className="rounded-md bg-[hsl(var(--foreground))] p-5 font-mono text-sm text-[hsl(var(--background))]">
              <p>$ validate url</p>
              <p>$ render public pages</p>
              <p>$ collect same-origin assets</p>
              <p>$ assemble static archive</p>
              <p>$ download ready</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
          >
            Run an export
          </Link>
        </div>
      </section>
    </main>
  );
}
