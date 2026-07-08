import type { ToEngine } from "@perps-monorepo/shared";
import { createRedisGroup } from "@perps-monorepo/shared";
import { createClient } from "redis";
const client = createClient();
client.connect();
const client2 = createClient();
client2.connect();
const promiseMap = new Map<string, any>();
const workerGroupid = `beWorker${crypto.randomUUID().slice(0, 8)}`;
export function loopbackqueue(
  message: ToEngine,
): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const loopbackid = crypto.randomUUID();
    promiseMap.set(loopbackid, resolve);
    //push to the queue
    const obj = { ...message, loopbackid };
    const res = JSON.stringify(obj);
    client.xAdd("incoming_stream", "*", { res });
    setTimeout(() => {
      promiseMap.delete(loopbackid);
      reject("some internal error occured");
    }, 10000);
  });
}
//createRedisGroup(client2, "from_engine", "beConsumerGroup");
async function listenforReplies() {
  await client2.subscribe("backendTopic", (rawMessage) => {
    const message = JSON.parse(rawMessage);
    const loopbackid = message.loopbackid;
    if (promiseMap.has(loopbackid)) {
      promiseMap.get(loopbackid)(message);
      promiseMap.delete(loopbackid);
    }
  });
}
listenforReplies();
// while (1) {
//     const response = await client2.xReadGroup(
//       "beConsumerGroup",
//       workerGroupid,
//       [{ key: "from_engine", id: ">" }],
//       { BLOCK: 0, COUNT: 1 },
//     );
//     if (!response) {
//       continue;
//     }
//     const message = response[0].messages[0].message;
//     const loopbackid = message.loopbackid;
//     if (promiseMap.has(loopbackid)) {
//       promiseMap.get(loopbackid)(message);
//       promiseMap.delete(loopbackid);
//     }
//     await client2.xAck(
//       "from_engine",
//       "beConsumerGroup",
//       response[0].messages[0].id,
//     );
//   }
