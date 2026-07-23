import { useEffect, useState } from "react";
import { useFetchBook } from "../hooks/useFetchBook";

// const BIDS = [
//   { p: 96418.5, sz: 1.842 },
//   { p: 96417.0, sz: 0.91 },
//   { p: 96415.5, sz: 2.104 },
//   { p: 96414.0, sz: 0.556 },
//   { p: 96412.5, sz: 3.221 },
//   { p: 96411.0, sz: 1.098 },
//   { p: 96409.5, sz: 0.74 },
//   { p: 96408.0, sz: 2.615 },
// ];

// const ASKS = [
//   { p: 96420.0, sz: 0.732 },
//   { p: 96421.5, sz: 1.41 },
//   { p: 96423.0, sz: 0.884 },
//   { p: 96424.5, sz: 2.96 },
//   { p: 96426.0, sz: 0.601 },
//   { p: 96427.5, sz: 1.755 },
//   { p: 96429.0, sz: 0.398 },
//   { p: 96430.5, sz: 3.102 },
// ];
function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#232A38] px-4 py-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#7C8598]">
        {children}
      </span>
    </div>
  );
}

function convertToArr(data: {
  asks: Record<number, number>;
  bids: Record<number, number>;
}) {
  let arrasks = [],
    arrbids = [];
  for (const key in data.asks) {
    let newobj = { p: Number(key), sz: data.asks[key] };
    arrasks.push(newobj);
  }
  for (const key in data.bids) {
    let newobj = { p: Number(key), sz: data.bids[key] };
    arrbids.push(newobj);
  }
  return { arrasks, arrbids };
}
export function OrderbookPanel({ symbol }: { symbol: string }) {
  const { data, isLoading, isError } = useFetchBook({ symbol });
  const [bids, setBids] = useState<{ p: number; sz: number }[]>([]);
  const [asks, setAsks] = useState<{ p: number; sz: number }[]>([]);
  useEffect(() => {
    if (!data) {
      return;
    }
    const { arrasks, arrbids } = convertToArr(data.result);
    setBids(arrbids);
    setAsks(arrasks);
  }, [data]);
  const maxSize = Math.max(...bids.map((b) => b.sz), ...asks.map((a) => a.sz));
  return (
    <div className="flex h-full flex-col rounded-[12px] border border-[#232A38] bg-[#12161F]">
      <PanelHeader>Orderbook</PanelHeader>

      <div className="grid grid-cols-3 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#7C8598]">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex-1 overflow-hidden px-2">
        {/* Asks — reversed so lowest ask sits nearest the spread */}
        <div className="space-y-[2px]">
          {[...asks].reverse().map((a) => (
            <div
              key={a.p}
              className="relative grid grid-cols-3 px-2 py-[3px] font-mono text-[12px]"
            >
              <div
                className="absolute inset-y-0 right-0 bg-[#F0555A]/10"
                style={{ width: `${(a.sz / maxSize) * 100}%` }}
              />
              <span className="relative text-[#F0555A]">
                {a.p.toLocaleString()}
              </span>
              <span className="relative text-right text-[#C7CCD6]">
                {a.sz.toFixed(3)}
              </span>
              {/* <span className="relative text-right text-[#7C8598]">
                {(a.p * a.sz).toFixed(0)}
              </span> */}
            </div>
          ))}
        </div>

        <div className="my-1 flex items-center justify-center gap-2 border-y border-[#232A38] py-2">
          <span className="font-mono text-[14px] font-semibold text-[#E7E9EE]">
            96,420.25
          </span>
          <span className="font-mono text-[11px] text-[#7C8598]">
            spread 1.50
          </span>
        </div>

        <div className="space-y-[2px]">
          {bids.map((b) => (
            <div
              key={b.p}
              className="relative grid grid-cols-3 px-2 py-[3px] font-mono text-[12px]"
            >
              <div
                className="absolute inset-y-0 right-0 bg-[#34D399]/10"
                style={{ width: `${(b.sz / maxSize) * 100}%` }}
              />
              <span className="relative text-[#34D399]">
                {b.p.toLocaleString()}
              </span>
              <span className="relative text-right text-[#C7CCD6]">
                {b.sz.toFixed(3)}
              </span>
              {/* <span className="relative text-right text-[#7C8598]">
                {(b.p * b.sz).toFixed(0)}
              </span> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
