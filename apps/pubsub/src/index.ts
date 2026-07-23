import { createClient } from "redis";
import { createRedisGroup } from "@perps-monorepo/shared";
const client = createClient();
client.connect();
createRedisGroup(client, "from_engine", "pubsubGroup");
const workerId = `pubsubWorkerId-${crypto.randomUUID().slice(0, 8)}`;
async function readMessages() {
  while (1) {
    const message = await client.xReadGroup(
      "pubsubGroup",
      workerId,
      [{ key: "from_engine", id: ">" }],
      { BLOCK: 0, COUNT: 1 },
    );
    if (!message) continue;
    const mssg = message[0].messages[0];
    // if(mssg.message.type==="priceUpdate"){

    // }
    if (mssg.message.loopbackid) {
      await client.publish("backendTopic", JSON.stringify(mssg.message));
    }
    if (mssg.message.type === "depthChange") {
      await client.publish("depthChange", JSON.stringify(mssg.message));
    }
    await client.xAck("from_engine", "pubsubGroup", mssg.id);
  }
}
readMessages();
