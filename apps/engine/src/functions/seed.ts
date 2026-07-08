import type { Orderbooks, Position } from "@perps-monorepo/shared";
import { readFileSync, writeFileSync } from "node:fs";
import Path from "node:path";
// seed.ts
const location = Path.join(process.cwd(), "data", "snapshot.json");
export let insurancefund: any = {};
export let positions: Position[] = [];
export let users: any = [];

export let orderbooks: Orderbooks = {};

export function savesnapshot(lastProcessedId: string) {
  const obj = { insurancefund, users, positions, orderbooks, lastProcessedId };
  writeFileSync(location, JSON.stringify(obj, null, 2), "utf-8");
}
export function readsnapshot() {
  const obj = readFileSync(location, "utf-8");
  const seedata = JSON.parse(obj);
  users = seedata.users;
  positions = seedata.positions;
  orderbooks = seedata.orderbooks;
  insurancefund = seedata.insurancefund;
  return seedata.lastProcessedId ?? null;
}
