"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@/lib/mixpanel";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/rates", label: "Rates" },
  { href: "/reserves", label: "Reserves" },
  { href: "/budget", label: "Budget" },
  { href: "/ask", label: "Ask" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-pop-yellow">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Logo tone="dark" size="md" />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => track("nav_click", { to: item.href, from: pathname })}
                className={`font-[family-name:var(--font-heading)] rounded-md px-3 py-1.5 text-sm text-on-pop transition-colors ${
                  active ? "bg-on-pop/10 underline decoration-2 underline-offset-4" : "hover:bg-on-pop/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/ask"
            onClick={() => track("nav_click", { to: "/ask", from: pathname, cta: true })}
            className="pop-btn pop-btn-pink py-2! text-xs! sm:text-sm!"
          >
            Ask the data ↗
          </Link>
        </div>
      </div>

      {/* Mobile nav row */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t-[2.5px] border-ink/20 px-4 py-1.5 md:hidden">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`font-[family-name:var(--font-heading)] whitespace-nowrap rounded-md px-2.5 py-1 text-xs text-on-pop ${
                active ? "bg-on-pop/10 underline" : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
