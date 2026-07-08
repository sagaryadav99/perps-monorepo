import { createOrder } from "./createOrder";
import { createPositions } from "./createPosition";
import { matching } from "./matching";
import { positions, users } from "./seed";
export function liquidationCheck(market: string, price: number) {
  for (const position of positions) {
    if (position.market === market && position.status === "open") {
      if (position.type === "long") {
        if (price <= position.liquidationPrice) {
          const order = createOrder({
            orderId: crypto.randomUUID(),
            userId: position.userId,
            market: market,
            side: position.type === "long" ? "short" : "long",
            qty: position.qty,
            leverage: position.leverage,
            type: "market",
            price: 0,
          });
          const user = users.find((x) => x.userId === position.userId);
          user!.orders.push(order!);
          const fills = matching(
            order!.market,
            position.userId,
            order!.orderId,
            order!.orderType,
            order!.type,
          );
          if (fills && fills.length != 0) {
            createPositions(fills, order!, true);
          }
        }
      } else {
        if (price >= position.liquidationPrice) {
          const order = createOrder({
            orderId: crypto.randomUUID(),
            userId: position.userId,
            market: market,
            side: position.type === "long" ? "short" : "long",
            qty: position.qty,
            leverage: position.leverage,
            type: "market",
            price: 0,
          });
          const user = users.find((x) => x.userId === position.userId);
          user!.orders.push(order!);
          const fills = matching(
            order!.market,
            position.userId,
            order!.orderId,
            order!.orderType,
            order!.type,
          );
          if (fills && fills.length != 0) {
            createPositions(fills, order!, true);
          }
        }
      }
    }
  }
}
