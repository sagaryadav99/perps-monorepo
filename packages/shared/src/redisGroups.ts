import type { RedisClientType } from "redis";
export async function createRedisGroup(
  redis: RedisClientType,
  streamName: string,
  groupName: string,
) {
  try {
    await redis.xGroupCreate(streamName, groupName, "$", { MKSTREAM: true });
  } catch (e: any) {
    if (!e.message.includes("BUSYGROUP")) {
      throw e;
    }
  }
}
