import { createOrder } from "./createOrder";
import { createPositions } from "./createPosition";
import { matching } from "./matching";
import { positions, users } from "./seed";

export function liquidationCheck(market: string, price: number) {
  const liquidationResults = [];

  for (const position of positions) {
    if (position.market !== market || position.status !== "open") {
      continue;
    }
    const shouldLiquidate =
      (position.type === "long" && price <= position.liquidationPrice) ||
      (position.type === "short" && price >= position.liquidationPrice);
    if (!shouldLiquidate) {
      continue;
    }
    const order = createOrder({
      orderId: crypto.randomUUID(),
      userId: position.userId,
      market,
      side: position.type === "long" ? "short" : "long",
      qty: position.qty,
      leverage: position.leverage,
      type: "market",
      price: 0,
    });
    const user = users.find((x) => x.userId === position.userId);
    if (!user || !order) {
      continue;
    }
    user.orders.push(order);
    const result = matching(
      order.market,
      position.userId,
      order.orderId,
      order.orderType,
      order.type,
    );
    if (!result) {
      continue;
    }
    if (result.fills.length > 0) {
      createPositions(result.fills, order, true);
    }
    liquidationResults.push(result);
  }
  return liquidationResults;
}
