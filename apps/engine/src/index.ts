import { createClient } from "redis";
import { addBalance, getBalance } from "./functions/addBalance";
import { createOrder } from "./functions/createOrder";
import { matching } from "./functions/matching";
import { createPositions } from "./functions/createPosition";
import type { Position } from "@perps-monorepo/shared";
import { liquidationCheck } from "./functions/liquidationCheck";
import {
  orderbooks,
  positions,
  readsnapshot,
  savesnapshot,
} from "./functions/seed";
const client = createClient();
client.connect();
const client2 = createClient();
client2.connect();
let lastProcessedId: string;
function start() {
  lastProcessedId = readsnapshot();
  console.log(lastProcessedId);
  if (lastProcessedId == null) {
    lastProcessedId = "$";
  }
}
start();
async function listentoQueue() {
  while (true) {
    const response = await client.xRead(
      { key: "incoming_stream", id: lastProcessedId },
      {
        BLOCK: 0,
        COUNT: 1,
      },
    );
    if (!response) {
      continue;
    }
    const message = JSON.parse(response[0].messages[0].message.res);
    //console.log(message);
    if (message.messageType === "onRamp") {
      const user = addBalance(message);
      client2.xAdd("from_engine", "*", {
        userId: user!.userId,
        totalAmount: user!.collateral.available.toString(),
        loopbackid: message.loopbackid,
      });
    } else if (message.messageType === "order") {
      const order = createOrder(message);
      if (order?.status !== "cancelled") {
        const result = matching(
          order!.market,
          message.userId,
          order!.orderId,
          order!.type,
          order!.orderType,
        );
        const depth = orderbooks["SOL"];
        console.log(depth);
        if (!result) {
          lastProcessedId = response[0].messages[0].id;
          continue;
        }
        const { fills, depthChanges, updatedOrders } = result;
        let updateMap: Record<string, Position[]> = {};
        if (fills && fills.length != 0) {
          let updates = createPositions(fills, order!, false);
          // console.log("Engine positions:", positions);
          for (const item of updates) {
            let positionsForUserId = positions.filter((x) => x.userId == item);
            updateMap[item] = positionsForUserId;
          }
          client2.xAdd("from_engine", "*", {
            type: "positionUpdate",
            updates: JSON.stringify(updateMap),
          });
        }
        client2.xAdd("from_engine", "*", {
          type: "dbUpdate",
          fills: JSON.stringify(fills),
          order: JSON.stringify(order),
          userId: message.userId,
          loopbackid: message.loopbackid,
          updatedOrders: JSON.stringify(updatedOrders),
        });
        client2.xAdd("from_engine", "*", {
          type: "depthChange",
          depthChanges: JSON.stringify(depthChanges),
          market: order!.market,
        });
      } else {
        client2.xAdd("from_engine", "*", {
          type: "dbUpdate",
          fills: JSON.stringify([]),
          order: JSON.stringify(order),
          loopbackid: message.loopbackid,
        });
      }
    } else if (message.messageType === "priceUpdate") {
      const market = message.market === "SOLUSDT" ? "SOL" : "ETH";
      const price =
        market === "SOL"
          ? Number(message.price.slice(0, 5))
          : Number(message.price.slice(0, 7));
      const timeStamp = message.timeStamp;
      // const liquidationResults = liquidationCheck(market, price);

      // for (const result of liquidationResults) {
      //   client2.xAdd("from_engine", "*", {
      //     type: "depthChange",
      //     market,
      //     depthChanges: JSON.stringify(result.depthChanges),
      //   });
      // }
      client2.xAdd("from_engine", "*", {
        type: "priceUpdate",
        market: market,
        price: price.toString(),
        timeStamp: timeStamp.toString(),
      });
    } else if (message.messageType === "getBalance") {
      const userId = message.userId;
      const result = getBalance(userId);
      client2.xAdd("from_engine", "*", {
        balance: result.toString(),
        loopbackid: message.loopbackid,
      });
    } else if (message.messageType === "getDepth") {
      const marketId = message.marketId;
      const depth = orderbooks[marketId];

      client2.xAdd("from_engine", "*", {
        depth: JSON.stringify(depth),
        loopbackid: message.loopbackid,
      });
    } else if (message.messageType === "getOpenPositions") {
      const marketId = message.marketId;
      const userId = message.userId;
      const openPositions = positions.filter((x) => {
        return (
          x.userId === userId && x.status === "open" && x.market === marketId
        );
      });
      client2.xAdd("from_engine", "*", {
        positions: JSON.stringify(openPositions),
        loopbackid: message.loopbackid,
      });
    }
    lastProcessedId = response[0].messages[0].id;
  }
}
listentoQueue();
// setInterval(() => {
//   console.log("saving snapshot");
//   savesnapshot(lastProcessedId);
//   console.log("snapshot saved");
// }, 1000 * 120);
