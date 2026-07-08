import { users, orderbooks } from "./seed";
import { cancelOrder } from "./cancelOrder";
import type { Fill } from "@perps-monorepo/shared";
export function matching(
  market: string,
  userId: string,
  orderId: string,
  orderType: string,
  type: string,
) {
  const fills: Fill[] = [];
  let marketorderbook = orderbooks[market];
  const user = users.find((x) => x.userId === userId);
  if (!user) {
    return;
  }
  const currorder = user.orders.find((x) => x.orderId === orderId);
  if (!currorder) {
    return;
  }
  if (!marketorderbook) return;
  const numkeys =
    type === "long"
      ? Object.keys(marketorderbook.asks)
          .map(Number)
          .sort((a, b) => a - b)
      : Object.keys(marketorderbook.bids)
          .map(Number)
          .sort((a, b) => b - a);
  let maps = type === "long" ? marketorderbook.asks : marketorderbook.bids;
  if (orderType === "market") {
    const totalAvailableQty = numkeys.reduce((sum, price) => {
      return sum + (maps[price]?.availableQty ?? 0);
    }, 0);
    if (currorder.qty > totalAvailableQty) {
      cancelOrder(user.userId, orderId, currorder.remainingQty);
      return [];
    }
    if (numkeys.length === 0 || !numkeys) {
      cancelOrder(userId, orderId, currorder.remainingQty);
      return fills;
    }
    for (let i = 0; i < numkeys.length; i++) {
      const price = numkeys[i];
      if (price == null) {
        continue;
      }
      const level = maps[price];
      if (!level) {
        continue;
      }
      for (let k = 0; k < level.openOrders.length; k++) {
        if (currorder.remainingQty === 0) {
          break;
        }
        const openorder = level.openOrders[k];
        if (!openorder) {
          continue;
        }
        let openRemaining = openorder.qty - openorder.filledQty;
        if (openRemaining <= currorder.remainingQty) {
          currorder.filledQty += openRemaining;
          currorder.remainingQty = currorder.qty - currorder.filledQty;
          openorder.filledQty += openRemaining;
          //create a fill for every order that matches one fill for every match
          const fill = {
            fillId: crypto.randomUUID(),
            market: currorder.market,
            price: price,
            qty: openRemaining,
            takerUserId: userId,
            makerUserId: openorder.userId as string,
            takerOrderId: currorder.orderId,
            makerOrderId: openorder.orderId as string,
            takerSide: type,
            createdAt: new Date(),
          };
          fills.push(fill);
          level.availableQty -= openRemaining;
          //delete from openorders
          level.openOrders.splice(k, 1);
          k--;
          if (currorder.remainingQty === 0) {
            currorder.status = "Filled";
            break;
          }
        } else {
          const matchedqty = currorder.remainingQty;
          currorder.filledQty += currorder.remainingQty;
          openorder.filledQty += currorder.remainingQty;
          level.availableQty -= currorder.remainingQty;
          currorder.remainingQty = currorder.qty - currorder.filledQty;
          //create a fill for this partially filled order
          const fill = {
            fillId: crypto.randomUUID(),
            market: currorder.market,
            price: price,
            qty: matchedqty,
            takerUserId: userId,
            makerUserId: openorder.userId as string,
            takerOrderId: currorder.orderId,
            makerOrderId: openorder.orderId as string,
            takerSide: type,
            createdAt: new Date(),
          };
          fills.push(fill);
          currorder.status = "Filled";
          break;
        }
      }
      marketorderbook.lastTradedPrice = price;
      if (level.openOrders.length === 0) {
        delete maps[price];
      }
      if (currorder.remainingQty === 0) {
        return fills;
      }
    }
  } else {
    let condition;
    if (numkeys[0]) {
      condition =
        type === "long"
          ? numkeys[0] > currorder.price
          : numkeys[0] < currorder.price;
    }
    if (numkeys.length == 0 || condition) {
      if (type === "long") {
        if (!marketorderbook.bids[currorder.price]) {
          marketorderbook.bids[currorder.price] = {
            availableQty: currorder.qty,
            openOrders: [
              {
                userId,
                orderId,
                qty: currorder.qty,
                filledQty: 0,
                createdAt: new Date(),
              },
            ],
          };
        } else {
          marketorderbook.bids[currorder.price]!.availableQty += currorder.qty;
          marketorderbook.bids[currorder.price]?.openOrders.push({
            userId,
            orderId,
            qty: currorder.qty,
            filledQty: 0,
            createdAt: new Date(),
          });
        }
      } else {
        if (!marketorderbook.asks[currorder.price]) {
          marketorderbook.asks[currorder.price] = {
            availableQty: currorder.qty,
            openOrders: [
              {
                userId,
                orderId,
                qty: currorder.qty,
                filledQty: 0,
                createdAt: new Date(),
              },
            ],
          };
        } else {
          marketorderbook.asks[currorder.price]!.availableQty += currorder.qty;
          marketorderbook.asks[currorder.price]?.openOrders.push({
            userId,
            orderId,
            qty: currorder.qty,
            filledQty: 0,
            createdAt: new Date(),
          });
        }
        return fills;
      }
    } else {
      for (let i = 0; i < numkeys.length; i++) {
        const price = numkeys[i];
        if (price == null) {
          continue;
        }
        let condition =
          type === "long" ? price <= currorder.price : price >= currorder.price;
        if (!condition) {
          break;
        }
        let level = maps[price];
        if (!level) {
          continue;
        }
        for (let k = 0; k < level.openOrders.length; k++) {
          let openorder = level.openOrders[k];
          if (!openorder) {
            continue;
          }
          let openRemaining = openorder.qty - openorder.filledQty;
          if (openRemaining <= currorder.remainingQty) {
            currorder.filledQty += openRemaining;
            currorder.remainingQty = currorder.qty - currorder.filledQty;
            openorder.filledQty = openorder.qty;
            //create a fill for this openorder
            const fill = {
              fillId: crypto.randomUUID(),
              market: currorder.market,
              price: price,
              qty: openRemaining,
              takerUserId: userId,
              makerUserId: openorder.userId,
              takerOrderId: currorder.orderId,
              makerOrderId: openorder.orderId,
              takerSide: type,
              createdAt: new Date(),
            };
            fills.push(fill);
            level.availableQty -= openRemaining;
            level.openOrders.splice(k, 1);
            k--;
            if (currorder.remainingQty === 0) {
              currorder.status = "Filled";
              break;
            }
          } else {
            const matchedqty = currorder.remainingQty;
            openorder.filledQty += currorder.remainingQty;
            level.availableQty -= currorder.remainingQty;
            currorder.filledQty += currorder.remainingQty;
            currorder.remainingQty = currorder.qty - currorder.filledQty;
            //create a fill for this partially filled order
            const fill = {
              fillId: crypto.randomUUID(),
              market: currorder.market,
              price: price,
              qty: matchedqty,
              takerUserId: userId,
              makerUserId: openorder.userId,
              takerOrderId: currorder.orderId,
              makerOrderId: openorder.orderId,
              takerSide: type,
              createdAt: new Date(),
            };
            fills.push(fill);
            break;
          }
        }
        marketorderbook.lastTradedPrice = price;
        if (level.openOrders.length === 0) {
          delete maps[price];
        }
        if (currorder.remainingQty === 0) {
          currorder.status = "Filled";
          break;
        }
      }
      if (currorder.remainingQty > 0) {
        if (type === "long") {
          if (!marketorderbook.bids[currorder.price]) {
            marketorderbook.bids[currorder.price] = {
              availableQty: currorder.qty - currorder.filledQty,
              openOrders: [
                {
                  userId,
                  orderId,
                  qty: currorder.qty,
                  filledQty: currorder.filledQty,
                  createdAt: new Date(),
                },
              ],
            };
          } else {
            marketorderbook.bids[currorder.price]!.availableQty +=
              currorder.qty - currorder.filledQty;
            marketorderbook.bids[currorder.price]?.openOrders.push({
              userId,
              orderId,
              qty: currorder.qty,
              filledQty: currorder.filledQty,
              createdAt: new Date(),
            });
          }
        } else {
          if (!marketorderbook.asks[currorder.price]) {
            marketorderbook.asks[currorder.price] = {
              availableQty: currorder.qty - currorder.filledQty,
              openOrders: [
                {
                  userId,
                  orderId,
                  qty: currorder.qty,
                  filledQty: currorder.filledQty,
                  createdAt: new Date(),
                },
              ],
            };
          } else {
            marketorderbook.asks[currorder.price]!.availableQty +=
              currorder.qty - currorder.filledQty;
            marketorderbook.asks[currorder.price]?.openOrders.push({
              userId,
              orderId,
              qty: currorder.qty,
              filledQty: currorder.filledQty,
              createdAt: new Date(),
            });
          }
        }
      }
      return fills;
    }
  }
  return fills;
}
