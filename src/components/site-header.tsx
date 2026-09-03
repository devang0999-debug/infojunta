"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@/lib/mixpanel";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/rates", label: "Rates" },
  { href: "/reserves", label: "Reserves" },
  { href: "/budget", label: "Budget" },
  { href: "/ask", label: "Ask" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-wide text-ink"
          onClick={() => track("nav_click", { to: "/", from: pathname })}
        >
          info<span className="text-pop-red">junta</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.slice(1).map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => track("nav_click", { to: item.href, from: pathname })}
                className={`font-[family-name:var(--font-heading)] rounded-lg border-[2.5px] border-ink px-2.5 py-1.5 text-xs sm:text-sm transition-transform hover:-translate-y-0.5 ${
                  active
                    ? "bg-pop-yellow shadow-[3px_3px_0_var(--color-ink)]"
                    : "bg-white shadow-[2px_2px_0_var(--color-ink)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
