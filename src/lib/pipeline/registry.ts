import { rbiPolicyRates } from "./sources/rbi-policy-rates";
import { rbiForexReserves } from "./sources/rbi-forex-reserves";
import { unionBudget } from "./sources/union-budget";
import type { SourceModule } from "./schema";

export const MODULE_LIST: SourceModule[] = [
  rbiPolicyRates,
  rbiForexReserves,
  unionBudget,
];

export const MODULES: Record<string, SourceModule> = Object.fromEntries(
  MODULE_LIST.map((m) => [m.key, m]),
);

export function getModule(key: string): SourceModule | undefined {
  return MODULES[key];
}
