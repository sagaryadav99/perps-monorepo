import { useState } from "react";
import { MarketSelector } from "./marketselector";

export function ChartPanel({ symbol }: { symbol: string }) {
  const [interval, setInterval] = useState(2);
  return (
    <div className="flex h-full flex-col rounded-[12px] border border-[#232A38] bg-[#12161F]">
      <MarketSelector />
      <div className="flex items-center justify-between border-b border-[#232A38] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#E7E9EE]">{symbol}</span>
          <span className="font-mono text-[13px] text-[#34D399]">
            96,420.50
          </span>
          <span className="font-mono text-[12px] text-[#34D399]">+2.14%</span>
        </div>
        <div className="flex items-center gap-1">
          {["5m", "15m", "1h", "4h", "1D"].map((tf, i) => (
            <button
              key={tf}
              onClick={() => {
                setInterval(i);
              }}
              className={`rounded-[5px] px-2.5 py-1 cursor-pointer font-mono text-[11px] transition-colors ${
                i === interval
                  ? "bg-[#1E2530] text-[#E7E9EE]"
                  : "text-[#7C8598] hover:text-[#E7E9EE]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart surface — swap for your charting lib (lightweight-charts, TradingView, etc.) */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#7C8598 1px, transparent 1px), linear-gradient(90deg, #7C8598 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <span className="relative font-mono text-[12px] text-[#4B5566]">
          chart renders here
        </span>
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
