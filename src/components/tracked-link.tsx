"use client";

import { track } from "@/lib/mixpanel";

/** External link that logs a source_link_clicked event before navigating. */
export function SourceLink({
  href,
  children,
  moduleKey,
  className,
}: {
  href: string;
  children: React.ReactNode;
  moduleKey?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("source_link_clicked", { href, module: moduleKey })}
      className={className}
    >
      {children}
    </a>
  );
}
