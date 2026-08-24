import { createClient } from "redis";
import { WebSocketServer } from "ws";
import { SocketManager } from "./socketmanager";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
const client = createClient();
client.connect();
const wss = new WebSocketServer({ port: 8080 });
const socketmgr = new SocketManager();
wss.on("connection", (ws, req) => {
  const cookie = req.headers.cookie;

  if (!cookie) {
    return ws.close();
  }

  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.slice("token=".length);

  if (!token) {
    return ws.close();
  }
  let userid: string;
  try {
    let decoded = jwt.verify(token!, process.env.JWT_SECRET!) as {
      userid: string;
      iat: number;
    };
    userid = decoded?.userid;
    if (!userid) {
      return ws.close();
    }
  } catch (e) {
    console.log(e);
    return ws.close();
  }
  socketmgr.subscribe(ws, "", userid);
  ws.on("error", console.error);
  ws.on("message", (rawMessage) => {
    const message = JSON.parse(rawMessage.toString());
    if (message.type === "subscribe") {
      socketmgr.subscribe(ws, message.market);
    }
    if (message.type === "unsubscribe") {
      socketmgr.unsubscribe(ws, message.market);
    }
  });
  ws.on("close", () => {
    socketmgr.unsubscribe(ws, "", userid);
    socketmgr.clearAllSubs(ws);
  });
});
async function listenDepthChange() {
  await client.subscribe(
    ["depthChange", "priceUpdate", "positionUpdate"],
    (rawMessage) => {
      const message = JSON.parse(rawMessage);
      switch (message.type) {
        case "depthChange":
          socketmgr.pushDepth(message.depthChanges, message.market);
          break;
        case "priceUpdate":
          socketmgr.pushPriceUpdate(message.price, message.market);
          break;
        case "positionUpdate":
          socketmgr.pushPositionUpdate(message.updates);
      }
      // if (message.type === "depthChange") {
      //   socketmgr.pushDepth(message.depthChanges, message.market);
      // } else {
      //   socketmgr.pushPriceUpdate(message.price, message.market);
      // }
    },
  );
}
listenDepthChange();
