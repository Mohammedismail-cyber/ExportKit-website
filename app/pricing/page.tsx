import Link from "next/link";
import { plans } from "../site-data";

export default function PricingPage() {
  return (
    <main>
      <section className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">
            Pricing
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
            Plans for lightweight exports and recurring handoffs.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
            Choose the workflow size that matches your export volume. Every plan keeps the same
            minimal black-and-white interface.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-16 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="flex rounded-lg border border-[hsl(var(--border))] p-6">
            <div className="flex w-full flex-col">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-3 min-h-14 leading-7 text-[hsl(var(--muted-foreground))]">
                {plan.description}
              </p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-semibold">{plan.price}</span>
                <span className="pb-2 text-sm text-[hsl(var(--muted-foreground))]">/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="text-[hsl(var(--foreground))]">+</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
              >
                Choose {plan.name}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
