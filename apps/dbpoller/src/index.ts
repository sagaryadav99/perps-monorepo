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
      ack.push(item.id);
      // if (item.message.messageType === "priceUpdate") {
      //   prices.push(item.message);
      // } else  {
      //   dbupdate.push(item.message);
      // }
      switch (item.message.type) {
        case "priceUpdate":
          prices.push(item.message);
          break;
        case "dbUpdate":
          dbupdate.push(item.message);
          break;
        default:
          break;
      }
    }

    //await client.xAck("from_engine", "dbpollerConsumerGroup", mssg.id);
  }
}
readMessages();
