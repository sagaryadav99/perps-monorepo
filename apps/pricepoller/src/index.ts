import { createClient } from "redis";
import WebSocket from "ws";
const client = createClient();
client.connect();
const BASE_URL = "wss://stream.binance.com:443/stream?streams=";
const streams = ["ethusdt@ticker", "solusdt@ticker"].join("/");
const ws = new WebSocket(`${BASE_URL}${streams}`);
console.log(`${BASE_URL}${streams}`);
ws.on("message", (rawData) => {
  const { data } = JSON.parse(rawData.toString());
  const obj = { messageType: "priceUpdate", market: data.s, price: data.c };
  const res = JSON.stringify(obj);
  client.xAdd("incoming_stream", "*", {
    res,
  });
});
