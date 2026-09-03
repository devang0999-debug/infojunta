/** colorKey (used across snapshots) → hex, for Recharts / inline styles. */
export const POP_COLORS: Record<string, string> = {
  "pop-red": "#ff3b30",
  "pop-yellow": "#ffd400",
  "pop-blue": "#2f6fed",
  "pop-pink": "#ff5da2",
  "pop-teal": "#16bdca",
  "pop-green": "#2fb457",
  "pop-purple": "#8b5cf6",
  flat: "#4b433a",
  ink: "#14100c",
};

export const POP_SEQUENCE = [
  "pop-blue",
  "pop-red",
  "pop-teal",
  "pop-purple",
  "pop-green",
  "pop-yellow",
  "pop-pink",
  "flat",
];

export function colorFor(key?: string): string {
  return POP_COLORS[key ?? ""] ?? POP_COLORS["pop-blue"];
}
