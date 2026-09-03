"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/mixpanel";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore storage failures
    }
    track("theme_toggled", { theme: next });
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="grid h-9 w-9 place-items-center rounded-lg border-[2.5px] border-ink bg-surface text-base shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
    >
      {/* Avoid hydration mismatch: render neutral until mounted */}
      <span aria-hidden>{!mounted ? "◐" : isDark ? "☀" : "☾"}</span>
    </button>
  );
}
