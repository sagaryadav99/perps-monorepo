import { createClient } from "redis";
import { prisma } from "@repo/db";
import { createRedisGroup } from "@perps-monorepo/shared";
const client = createClient();
client.connect();
console.log("connected through redis client");
createRedisGroup(client, "from_engine", "dbpollerConsumerGroup");
const workerid = `DbpollerWorkerId-${crypto.randomUUID().slice(0, 8)}`;
async function readMessages() {
  while (1) {
    const message = await client.xReadGroup(
      "dbpollerConsumerGroup",
      workerid,
      [{ key: "from_engine", id: ">" }],
      {
        BLOCK: 0,
        COUNT: 1,
      },
    );
    const mssg = message[0].messages[0];
    await client.xAck("from_engine", "dbpollerConsumerGroup", mssg.id);
  }
}
readMessages();
