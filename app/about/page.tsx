import { features } from "../site-data";

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">
            About
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
            Built for clean handoffs, archives, and static reviews.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
            ExportKit is a focused tool for turning public rendered websites into downloadable
            static archives. It is designed for teams that need fast review packages without
            changing the source project.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal">A restrained product surface.</h2>
          <p className="mt-4 leading-7 text-[hsl(var(--muted-foreground))]">
            The interface keeps attention on the export job: source URL, permission, progress, and
            download state. The black-and-white theme helps the tool feel quiet and operational.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-[hsl(var(--border))] p-6">
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-[hsl(var(--muted-foreground))]">{feature.text}</p>
            </article>
          ))}
          <article className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--foreground))] p-6 text-[hsl(var(--background))]">
            <h3 className="font-semibold">Theme ready</h3>
            <p className="mt-3 leading-7 opacity-75">
              The whole website uses shared variables, so the header toggle changes every route.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
