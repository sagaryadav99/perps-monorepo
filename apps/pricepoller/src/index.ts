import { createClient } from "redis";
import WebSocket from "ws";
const client = createClient();
client.connect();
const BASE_URL = "wss://stream.binance.com:443/stream?streams=";
const streams = ["ethusdt@ticker", "solusdt@ticker"].join("/");
const ws = new WebSocket(`${BASE_URL}${streams}`);
const priceMap = new Map();
ws.on("message", (rawData) => {
  const { data } = JSON.parse(rawData.toString());

  const obj = {
    messageType: "priceUpdate",
    market: data.s,
    price: data.c,
    timeStamp: data.E,
  };
  const res = JSON.stringify(obj);
  priceMap.set(data.s, res);
});
setInterval(() => {
  for (const [key, value] of priceMap) {
    client.xAdd("incoming_stream", "*", {
      res: value,
    });
  }
}, 3000);
