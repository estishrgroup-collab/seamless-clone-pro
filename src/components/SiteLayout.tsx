import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { siteContentQuery } from "@/lib/site-data";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const { data: content } = useQuery(siteContentQuery);
  const brand = content?.["brand_name"] ?? "Westgate Arena";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass-bar sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-primary/40 font-display text-base text-primary">
              {brand.charAt(0)}
            </span>
            <span className="font-display text-xl leading-none tracking-tight">{brand}</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
                className="relative transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/events" className="btn-primary hidden py-2 text-xs sm:inline-flex">
              Vote now
            </Link>
          </nav>
        </div>
        <div className="hairline-gold" />
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-3">
          <div className="space-y-3">
            <p className="font-display text-2xl">{brand}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {content?.["footer_tagline"] ??
                "Live modelling competitions and audience voting in Nairobi, Kenya."}
            </p>
          </div>
          <div className="space-y-3">
            <p className="label-xs">Explore</p>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="space-y-3">
            <p className="label-xs">Get in touch</p>
            <p className="text-sm text-muted-foreground">{content?.["contact_email"]}</p>
            <p className="text-sm text-muted-foreground">{content?.["contact_address"]}</p>
            <Link
              to="/admin"
              className="inline-block text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Admin dashboard
            </Link>
          </div>
        </div>
        <div className="border-t border-border">
          <p className="mx-auto max-w-6xl px-6 py-5 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {brand}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
