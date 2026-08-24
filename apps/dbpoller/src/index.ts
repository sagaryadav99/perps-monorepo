import "dotenv/config";
import { createClient } from "redis";
import { prisma } from "@repo/db";
import {
  createRedisGroup,
  setTimeoutPromisified,
} from "@perps-monorepo/shared";

const client = createClient();

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

async function start() {
  await client.connect();
  console.log("connected through redis client");

  await createRedisGroup(client, "from_engine", "dbpollerConsumerGroup");

  const workerid = `DbpollerWorkerId-${crypto.randomUUID().slice(0, 8)}`;

  async function readMessages() {
    while (true) {
      const ack: string[] = [];
      const priceack: string[] = [];
      const prices: any[] = [];
      const dbupdate: any[] = [];

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

      if (!message || message.length === 0) {
        continue;
      }

      const mssg = message[0].messages;
      for (const item of mssg) {
        switch (item.message.type) {
          case "priceUpdate":
            priceack.push(item.id);
            prices.push(item.message);
            break;
          case "dbUpdate":
            dbupdate.push({
              id: item.id,
              message: item.message,
            });
            break;
          default:
            ack.push(item.id);
            break;
        }
      }

      for (const item of ack) {
        await client.xAck("from_engine", "dbpollerConsumerGroup", item);
      }

      if (prices.length > 0) {
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
      }

      for (const item of dbupdate) {
        try {
          const order = JSON.parse(item.message.order);
          const fills = JSON.parse(item.message.fills);
          const updatedOrders = JSON.parse(item.message.updatedOrders);

          await prisma.$transaction(async (tx) => {
            await tx.order.upsert({
              where: {
                id: order.orderId,
              },
              create: {
                id: order.orderId,
                userId: item.message.userId,
                market_id: order.market,
                orderType: order.type === "market" ? "Market" : "Limit",
                type: order.orderType === "long" ? "Long" : "Short",
                price: order.price,
                qty: order.qty,
                initialMargin: order.margin,
                filledQty: order.filledQty,
                remainingQty: order.remainingQty,
                leverage: order.leverage,
                status: order.status,
                createdAt: new Date(order.createdAt),
              },
              update: {
                filledQty: order.filledQty,
                remainingQty: order.remainingQty,
                status: order.status,
              },
            });
            for (const updatedOrder of updatedOrders) {
              await tx.order.update({
                where: {
                  id: updatedOrder.orderId,
                },

                data: {
                  filledQty: updatedOrder.filledQty,
                  remainingQty: updatedOrder.remainingQty,
                  status: updatedOrder.status,
                },
              });
            }
            if (fills.length > 0) {
              await tx.fill.createMany({
                data: fills.map((fill: any) => ({
                  id: fill.fillId,
                  marketId: fill.market,
                  price: fill.price,
                  qty: fill.qty,
                  takerUserId: fill.takerUserId,
                  makerUserId: fill.makerUserId,
                  takerOrderId: fill.takerOrderId,
                  makerOrderId: fill.makerOrderId,
                  takerSide: fill.takerSide === "long" ? "Long" : "Short",
                  createdAt: new Date(fill.createdAt),
                })),

                skipDuplicates: true,
              });
            }
          });
          await client.xAck("from_engine", "dbpollerConsumerGroup", item.id);

          console.log("DB update completed:", order.orderId);
        } catch (error) {
          console.error(`Failed to process DB update ${item.id}:`, error);
        }
      }
    }
  }

  await readMessages();
}

start().catch((error) => {
  console.error("DB Poller crashed:", error);
  process.exit(1);
});
