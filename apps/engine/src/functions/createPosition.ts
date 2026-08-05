import type { Fill, Order } from "@perps-monorepo/shared";
import { insurancefund, positions, users } from "./seed";
export function createPositions(
  fills: Fill[],
  order: Order,
  liquidated: boolean,
) {
  for (const fill of fills) {
    updatePosition(
      fill.takerUserId,
      fill.takerSide,
      fill,
      fill.takerOrderId,
      liquidated,
    );
    const makerSide = fill.takerSide === "long" ? "short" : "long";
    updatePosition(
      fill.makerUserId,
      makerSide,
      fill,
      fill.makerOrderId,
      liquidated,
    );
  }
}
function updatePosition(
  userId: string,
  side: string,
  fill: Fill,
  orderId: string,
  liquidated: boolean,
) {
  console.log("Fill:", fill);
  console.log("updatePosition", {
    userId,
    side,
    orderId,
  });
  const user = users.find((x: any) => x.userId == userId);
  const order = user!.orders.find((x: any) => x.orderId == orderId);
  const position = positions.find((x) => {
    return (
      x.userId === userId && x.market === fill.market && x.status === "open"
    );
  });
  if (!position) {
    const newPosition = {
      positionId: crypto.randomUUID(),
      userId,
      market: fill.market,
      qty: fill.qty,
      type: side,
      margin: (order!.margin / order!.qty) * fill.qty,
      averagePrice: fill.price,
      pnl: 0,
      liquidationPrice: liquidatPriceCalc(fill.price, side, order!.leverage),
      status: "open" as const,
      leverage: order!.leverage,
    };
    positions.push(newPosition);
  } else if (position.type === side) {
    const totalqty = position.qty + fill.qty;
    const totalprice =
      position.qty * position.averagePrice + fill.qty * fill.price;
    position.averagePrice = totalprice / totalqty;
    position.qty = totalqty;
    position.margin += (order!.margin / order!.qty) * fill.qty;
    position.liquidationPrice = liquidatPriceCalc(
      position.averagePrice,
      side,
      order!.leverage,
    );
  } else {
    if (position.qty === fill.qty) {
      position.pnl =
        position.type === "long"
          ? (fill.price - position.averagePrice) * fill.qty
          : (position.averagePrice - fill.price) * fill.qty;
      user!.collateral.locked -= position.margin;
      if (liquidated) {
        if (position.pnl > 0) {
          user!.collateral.available += position.pnl;
          insurancefund.fund += position.margin - position.pnl;
        } else {
          insurancefund.fund += position.margin;
        }
      } else {
        user!.collateral.available += position.margin;
        user!.collateral.available += position.pnl;
      }
      position.status = "closed";
    } else if (position.qty > fill.qty) {
      const marginReturn = (position.margin / position.qty) * fill.qty;
      const realizedpnl =
        position.type === "long"
          ? (fill.price - position.averagePrice) * fill.qty
          : (position.averagePrice - fill.price) * fill.qty;
      position.pnl += realizedpnl;
      position.qty -= fill.qty;
      position.margin -= marginReturn;
      user!.collateral.locked -= marginReturn;
      if (liquidated) {
        insurancefund.fund += marginReturn;
        if (realizedpnl > 0) {
          user!.collateral.available += realizedpnl;
        }
      } else {
        user!.collateral.available += marginReturn + realizedpnl;
      }
    } else {
      if (liquidated) {
        return;
      }
      const closingqty = position.qty;
      const remainingQty = fill.qty - position.qty;
      const realizedpnl =
        position.type === "long"
          ? (fill.price - position.averagePrice) * closingqty
          : (position.averagePrice - fill.price) * closingqty;
      position.pnl += realizedpnl;
      position.status = "closed";
      user!.collateral.locked -= position.margin;
      user!.collateral.available += position.margin + realizedpnl;
      positions.push({
        positionId: crypto.randomUUID(),
        userId,
        market: position.market,
        type: side,
        qty: remainingQty,
        margin: (order!.margin / order!.qty) * remainingQty,
        liquidationPrice: liquidatPriceCalc(fill.price, side, order!.leverage),
        averagePrice: fill.price,
        pnl: 0,
        status: "open",
        leverage: order!.leverage,
      });
    }
  }
}
function liquidatPriceCalc(
  averagePrice: number,
  side: string,
  leverage: number,
) {
  if (side === "long") {
    return averagePrice * (1 - 1 / leverage);
  } else {
    return averagePrice * (1 + 1 / leverage);
  }
}
