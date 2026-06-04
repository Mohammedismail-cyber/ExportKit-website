import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExportKit - Static website exports",
  description: "A modern black and white site exporter for public web pages."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}"
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
          <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 backdrop-blur">
            <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--foreground))] text-sm font-semibold text-[hsl(var(--background))]">
                  EK
                </span>
                <span className="font-semibold">ExportKit</span>
              </Link>
              <div className="hidden items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] md:flex">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/how-it-works">How it works</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/contact">Contact</NavLink>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link
                  href="/pricing"
                  className="hidden h-10 items-center rounded-md bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))] transition hover:opacity-90 sm:inline-flex"
                >
                  Start now
                </Link>
              </div>
            </nav>
          </header>
          {children}
          <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
            <div className="mx-auto w-full max-w-6xl px-5 py-12">
              <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
                <div>
                  <Link href="/" className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--foreground))] text-sm font-semibold text-[hsl(var(--background))]">
                      EK
                    </span>
                    <span className="text-lg font-semibold">ExportKit</span>
                  </Link>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                    A focused black-and-white tool for exporting public rendered websites into
                    static ZIP archives.
                  </p>
                  <div className="mt-5 flex gap-2">
                    <FooterIcon label="X" />
                    <FooterIcon label="GH" />
                    <FooterIcon label="IN" />
                  </div>
                </div>

                <FooterGroup
                  title="Pages"
                  links={[
                    { href: "/", label: "Home" },
                    { href: "/about", label: "About" },
                    { href: "/how-it-works", label: "How it works" },
                    { href: "/pricing", label: "Pricing" },
                    { href: "/contact", label: "Contact" }
                  ]}
                />

                <FooterGroup
                  title="Product"
                  links={[
                    { href: "/", label: "Export workflow" },
                    { href: "/how-it-works", label: "Static archive" },
                    { href: "/pricing", label: "Plans" }
                  ]}
                />

                <div>
                  <h2 className="text-sm font-semibold">Contact</h2>
                  <div className="mt-4 space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                    <p>hello@exportkit.local</p>
                    <p>Remote support for export reviews and handoffs.</p>
                  </div>
                  <Link
                    href="/contact"
                    className="mt-5 inline-flex h-10 items-center rounded-md bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
                  >
                    Get in touch
                  </Link>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 border-t border-[hsl(var(--border))] pt-6 text-sm text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
                <p>© 2026 ExportKit. All rights reserved.</p>
                <div className="flex gap-4">
                  <Link href="/pricing" className="transition hover:text-[hsl(var(--foreground))]">
                    Terms
                  </Link>
                  <Link href="/contact" className="transition hover:text-[hsl(var(--foreground))]">
                    Privacy
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
    >
      {children}
    </Link>
  );
}

function FooterGroup({
  title,
  links
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4 flex flex-col gap-3 text-sm text-[hsl(var(--muted-foreground))]">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="transition hover:text-[hsl(var(--foreground))]">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function FooterIcon({ label }: { label: string }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--muted-foreground))]">
      {label}
    </span>
  );
}
