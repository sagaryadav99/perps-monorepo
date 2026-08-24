import type { Bid } from "@perps-monorepo/shared";

export function transform(side: Record<string, Bid>) {
  const newobj: Record<string, number> = {};
  for (const key in side) {
    newobj[key] = side[key]!.availableQty;
  }
  return newobj;
}
