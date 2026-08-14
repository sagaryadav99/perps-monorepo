import { useEffect, useRef, useState } from "react";
import { ChartPanel } from "./chartpanel";
import { OrderbookPanel } from "./orderbook";
import { OrderFormPanel } from "./orderform";
import { PositionsPanel } from "./positions";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export function Dashboard() {
  const queryclient = useQueryClient();
  const { symbol = "SOL" } = useParams();
  useEffect(() => {
    const wss = new WebSocket("ws://localhost:8080");
    wss.onopen = () => {
      wss.send(JSON.stringify({ type: "subscribe", market: symbol }));
    };
    wss.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.type === "depthChange") {
        queryclient.setQueryData(
          ["book", symbol],
          (old: {
            asks: Record<number, number>;
            bids: Record<number, number>;
          }) => {
            const asks = { ...old.asks };
            const bids = { ...old.bids };
            for (const item of JSON.parse(data.data)) {
              if (item.side === "bid") {
                bids[item.price] = item.quantity;
                if (bids[item.price] === 0) {
                  delete bids[item.price];
                }
              } else {
                asks[item.price] = item.quantity;
                if (asks[item.price] === 0) {
                  delete asks[item.price];
                }
              }
            }
            return { asks, bids };
          },
        );
      } else if (data.type === "priceUpdate") {
        queryclient.setQueryData(["price", symbol], () => {
          return data.data;
        });
      } else if (data.type === "positionUpdate") {
        queryclient.setQueryData(["positions", symbol], () => {
          return data.positionUpdate;
        });
      }
    };
    return () => {
      wss.send(JSON.stringify({ type: "unsubscribe", market: symbol }));
      wss.close();
    };
  }, [symbol]);
  return (
    <div className="flex min-h-screen flex-col gap-3 p-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px_320px] lg:h-[560px]">
        <ChartPanel symbol={symbol} />
        <OrderbookPanel symbol={symbol} />
        <OrderFormPanel symbol={symbol} />
      </div>
      <PositionsPanel symbol={symbol} />
    </div>
  );
}
