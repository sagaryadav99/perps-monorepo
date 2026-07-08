import type { ToEngine } from "@perps-monorepo/shared";
import { users } from "./seed";

export function addBalance(message: ToEngine) {
  if (message.messageType !== "onRamp") {
    return;
  }
  const user = users.find((x) => x.userId === message.userId);
  if (!user) {
    users.push({
      userId: message.userId,
      collateral: { available: message.amount, locked: 0 },
      orders: [],
    });
    return {
      userId: message.userId,
      collateral: { available: message.amount, locked: 0 },
      orders: [],
    };
  } else {
    user.collateral.available += message.amount;
  }

  return user;
}
export function getBalance(userId: string) {
  const user = users.find((x) => x.userId === userId);
  if (!user) {
    return "no user found";
  }
  return user.collateral.available;
}
