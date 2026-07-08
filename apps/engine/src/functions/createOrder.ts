import type { Order, ToEngine } from "@perps-monorepo/shared";
import { orderbooks, users } from "./seed";

export function createOrder(message: ToEngine): Order | null {
  if (message.messageType === "order") {
    const user = users.find((x) => x.userId === message.userId);
    let marginrequired;
    if (message.type === "market") {
      let lastPrice = orderbooks[message.market]?.lastTradedPrice;
      let positionValue = message.qty * lastPrice!;
      marginrequired = positionValue / message.leverage;
    } else {
      let positionValue = message.qty * message.price;
      marginrequired = positionValue / message.leverage;
    }
    if (marginrequired <= user!.collateral.available) {
      const newlocked = user!.collateral.locked + marginrequired;
      const newavailable = user!.collateral.available - marginrequired;
      user!.collateral.locked = newlocked;
      user!.collateral.available = newavailable;
    } else {
      const cancelledorder = {
        orderId: message.orderId,
        market: message.market,
        type: message.type,
        qty: message.qty,
        margin: marginrequired,
        filledQty: 0,
        remainingQty: message.qty,
        leverage: message.leverage,
        orderType: message.side,
        price: message.price,
        status: "Cancelled",
        createdAt: new Date(),
      };
      user!.orders.push(cancelledorder);
      return cancelledorder;
    }
    const order = {
      orderId: message.orderId,
      market: message.market,
      type: message.type,
      qty: message.qty,
      margin: marginrequired,
      filledQty: 0,
      remainingQty: message.qty,
      leverage: message.leverage,
      orderType: message.side,
      price: message.price,
      status: "Open",
      createdAt: new Date(),
    };
    user!.orders.push(order);
    return order;
  } else {
    return null;
  }
}
