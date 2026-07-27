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
  let cookie = req.headers.cookie;
  if (!cookie) {
    return ws.close();
  }
  let token = cookie.split("=").slice(-1)[0];
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
    console.log("message received", message);
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
  await client.subscribe(["depthChange", "priceUpdate"], (rawMessage) => {
    const message = JSON.parse(rawMessage);
    if (message.type === "depthChange") {
      socketmgr.pushDepth(message.depthChanges, message.market);
    } else {
      socketmgr.pushPriceUpdate(message.price, message.market);
    }
  });
}
listenDepthChange();
