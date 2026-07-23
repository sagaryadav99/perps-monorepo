import { ChartPanel } from "./chartpanel";
import { OrderbookPanel } from "./orderbook";
import { OrderFormPanel } from "./orderform";
import { PositionsPanel } from "./positions";
import { useParams } from "react-router-dom";

export function Dashboard() {
  const { symbol = "SOL" } = useParams();
  return (
    <div className="flex min-h-screen flex-col gap-3 p-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px_320px] lg:h-[560px]">
        <ChartPanel symbol={symbol} />
        <OrderbookPanel symbol={symbol} />
        <OrderFormPanel symbol={symbol} />
      </div>
      <PositionsPanel />
    </div>
  );
}
