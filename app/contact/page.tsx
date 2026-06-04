export default function ContactPage() {
  return (
    <main>
      <section className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">
            Contact
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
            Talk through an export workflow.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
            Send a note about your pages, volume, or handoff process. The form is styled to match
            the rest of the shadcn-inspired interface.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-[hsl(var(--border))] p-6">
          <h2 className="text-2xl font-semibold">Contact details</h2>
          <div className="mt-6 space-y-5 text-[hsl(var(--muted-foreground))]">
            <p>
              <span className="block text-sm font-medium text-[hsl(var(--foreground))]">Email</span>
              hello@exportkit.local
            </p>
            <p>
              <span className="block text-sm font-medium text-[hsl(var(--foreground))]">Response</span>
              Usually within one business day.
            </p>
            <p>
              <span className="block text-sm font-medium text-[hsl(var(--foreground))]">Best for</span>
              Static archives, rendered-page exports, and review handoffs.
            </p>
          </div>
        </div>

        <form className="rounded-lg border border-[hsl(var(--border))] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Name
              <input
                className="mt-2 h-11 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="Your name"
              />
            </label>
            <label className="text-sm font-medium">
              Email
              <input
                type="email"
                className="mt-2 h-11 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium">
            Project URL
            <input
              type="url"
              className="mt-2 h-11 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              placeholder="https://example.com"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Message
            <textarea
              className="mt-2 min-h-36 w-full resize-y rounded-md border border-[hsl(var(--input))] bg-transparent p-3 outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              placeholder="Tell us what you need to export."
            />
          </label>
          <button
            type="button"
            className="mt-5 h-11 rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
          >
            Send message
          </button>
        </form>
      </section>
    </main>
  );
}
