import "dotenv/config";
import { createClient } from "redis";
import { prisma } from "@repo/db";
import {
  createRedisGroup,
  setTimeoutPromisified,
} from "@perps-monorepo/shared";
const client = createClient();
client.connect();
console.log("connected through redis client");
createRedisGroup(client, "from_engine", "dbpollerConsumerGroup");
const workerid = `DbpollerWorkerId-${crypto.randomUUID().slice(0, 8)}`;
async function readMessages() {
  while (1) {
    let ack = [];
    let priceack = [];
    let dback = [];
    let prices = [];
    let dbupdate = [];
    await setTimeoutPromisified(10000);
    const message = await client.xReadGroup(
      "dbpollerConsumerGroup",
      workerid,
      [{ key: "from_engine", id: ">" }],
      {
        BLOCK: 0,
        COUNT: 200,
      },
    );

    const mssg = message[0].messages;
    for (const item of mssg) {
      switch (item.message.type) {
        case "priceUpdate":
          priceack.push(item.id);
          prices.push(item.message);
          break;
        case "dbUpdate":
          dback.push(item.id);
          dbupdate.push(item.message);
          break;
        default:
          ack.push(item.id);
          break;
      }
    }
    console.log("ack", ack);
    for (const item of ack) {
      await client.xAck("from_engine", "dbpollerConsumerGroup", item);
    }
    console.log("prices", prices);
    console.log("priceack", priceack);
    await prisma.priceUpdates.createMany({
      data: prices.map((price) => ({
        id: crypto.randomUUID(),
        timestamp: new Date(Number(price.timeStamp)),
        symbol: price.market,
        price: price.price,
      })),
    });
    for (const item of priceack) {
      await client.xAck("from_engine", "dbpollerConsumerGroup", item);
    }

    //await client.xAck("from_engine", "dbpollerConsumerGroup", mssg.id);
  }
}
readMessages();
