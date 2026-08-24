import { useState } from "react";
import { MarketSelector } from "./marketselector";
import { PriceTicker } from "./priceticker";
import { CandleChart } from "./candlechart";
import { useCandles } from "../hooks/useCandles";

export function ChartPanel({ symbol }: { symbol: string }) {
  const [interval, setInterval] = useState("1m");

  const {
    data: candles = [],
    isLoading,
    isError,
  } = useCandles(symbol, interval);

  return (
    <div className="flex h-full flex-col rounded-[12px] border border-[#232A38] bg-[#12161F]">
      <MarketSelector />

      <div className="flex items-center justify-between border-b border-[#232A38] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#E7E9EE]">{symbol}</span>

          <span className="flex font-mono">
            <PriceTicker symbol={symbol} />
          </span>
        </div>

        <div className="flex items-center gap-1">
          {["1m", "5m", "10m", "30m"].map((tf) => (
            <button
              key={tf}
              onClick={() => setInterval(tf)}
              className={`cursor-pointer rounded-[5px] px-2.5 py-1 font-mono text-[11px] transition-colors ${
                tf === interval
                  ? "bg-[#1E2530] text-[#E7E9EE]"
                  : "text-[#7C8598] hover:text-[#E7E9EE]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {isLoading && (
          <div className="flex h-full items-center justify-center font-mono text-[12px] text-[#7C8598]">
            Loading candles...
          </div>
        )}

        {isError && (
          <div className="flex h-full items-center justify-center font-mono text-[12px] text-red-400">
            Failed to load candles
          </div>
        )}

        {!isLoading && !isError && <CandleChart data={candles} />}
      </div>

      <div className="grid grid-cols-4 gap-px border-t border-[#232A38] bg-[#232A38]">
        {[
          { l: "24h High", v: "97,102.00" },
          { l: "24h Low", v: "94,880.50" },
          { l: "24h Volume", v: "18,204.6" },
          { l: "Funding", v: "0.0041%" },
        ].map((s) => (
          <div key={s.l} className="bg-[#12161F] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#7C8598]">
              {s.l}
            </div>

            <div className="mt-1 font-mono text-[13px] text-[#E7E9EE]">
              {s.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
