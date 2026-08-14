// components/positions-panel.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

type Tab = "positions" | "open" | "history" | "trades";

// const POSITIONS = [
//   {
//     symbol: "BTC-PERP",
//     side: "long",
//     size: 0.842,
//     entry: 94120.5,
//     mark: 96420.25,
//     pnl: 1936.42,
//     pnlPct: 24.4,
//     liq: 84210.0,
//   },
//   {
//     symbol: "ETH-PERP",
//     side: "short",
//     size: 4.2,
//     entry: 3580.0,
//     mark: 3512.8,
//     pnl: 282.24,
//     pnlPct: 6.8,
//     liq: 3921.5,
//   },
// ];

const OPEN_ORDERS = [
  {
    symbol: "SOL-PERP",
    side: "long",
    type: "Limit",
    price: 172.0,
    size: 12.0,
    filled: 0,
    time: "14:02:11",
  },
  {
    symbol: "ARB-PERP",
    side: "short",
    type: "Limit",
    price: 0.845,
    size: 500,
    filled: 120,
    time: "13:47:55",
  },
];

const ORDER_HISTORY = [
  {
    symbol: "BTC-PERP",
    side: "long",
    type: "Market",
    price: 94120.5,
    size: 0.842,
    status: "Filled",
    time: "07/19 09:12",
  },
  {
    symbol: "AVAX-PERP",
    side: "short",
    type: "Limit",
    price: 42.5,
    size: 20,
    status: "Cancelled",
    time: "07/18 16:30",
  },
];

const TRADE_HISTORY = [
  {
    symbol: "BTC-PERP",
    side: "long",
    price: 94120.5,
    size: 0.842,
    fee: 3.96,
    time: "07/19 09:12",
  },
  {
    symbol: "OP-PERP",
    side: "short",
    price: 2.21,
    size: 800,
    fee: 0.71,
    time: "07/17 11:04",
  },
];

const TABS: { key: Tab; label: string }[] = [
  { key: "positions", label: "Positions" },
  { key: "open", label: "Open orders" },
  { key: "history", label: "Order history" },
  { key: "trades", label: "Trade history" },
];

function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[#7C8598] ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  right,
  className = "",
}: {
  children: React.ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-2.5 font-mono text-[12px] ${right ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </td>
  );
}

function SideTag({ side }: { side: string }) {
  const isLong = side === "long";
  return (
    <span
      className={`font-mono text-[11px] uppercase ${isLong ? "text-[#34D399]" : "text-[#F0555A]"}`}
    >
      {side}
    </span>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-8 text-center font-mono text-[12px] text-[#4B5566]"
      >
        {label}
      </td>
    </tr>
  );
}

function PositionsTable({ positions }: { positions: any[] }) {
  if (positions.length === 0)
    return <EmptyTable colSpan={8} label="No open positions" />;
  return (
    <table className="w-full">
      <thead className="border-b border-[#232A38]">
        <tr>
          <Th>Market</Th>
          <Th>Side</Th>
          <Th right>Size</Th>
          <Th right>Entry price</Th>
          {/* <Th right>Mark price</Th> */}
          <Th right>Liq. price</Th>
          <Th right>PNL</Th>
          <Th right>Close</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#1A1F2B]">
        {positions.map((p: any) => (
          <tr key={p.market} className="hover:bg-[#151A24]">
            <Td className="text-[#E7E9EE]">{p.market}</Td>
            <Td>
              <SideTag side={p.type} />
            </Td>
            <Td right className="text-[#C7CCD6]">
              {p.qty}
            </Td>
            <Td right className="text-[#C7CCD6]">
              {p.averagePrice.toLocaleString()}
            </Td>
            {/* <Td right className="text-[#C7CCD6]">
              {p.mark.toLocaleString()}
            </Td> */}
            <Td right className="text-[#F0555A]">
              {p.liquidationPrice.toLocaleString()}
            </Td>
            <Td
              right
              className={p.pnl >= 0 ? "text-[#34D399]" : "text-[#F0555A]"}
            >
              {p.pnl >= 0 ? "+" : ""}
              {p.pnl.toFixed(2)} ( {p.pnlPct >= 0 ? "+" : ""}
              {p.pnlPct}%)
            </Td>
            <Td right>
              <button className="rounded-[5px] border border-[#232A38] px-2.5 py-1 text-[11px] text-[#C7CCD6] transition-colors hover:border-[#F0555A] hover:text-[#F0555A]">
                Close
              </button>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OpenOrdersTable() {
  if (OPEN_ORDERS.length === 0)
    return <EmptyTable colSpan={8} label="No open orders" />;
  return (
    <table className="w-full">
      <thead className="border-b border-[#232A38]">
        <tr>
          <Th>Market</Th>
          <Th>Side</Th>
          <Th>Type</Th>
          <Th right>Price</Th>
          <Th right>Size</Th>
          <Th right>Filled</Th>
          <Th right>Time</Th>
          <Th right>Cancel</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#1A1F2B]">
        {OPEN_ORDERS.map((o, i) => (
          <tr key={i} className="hover:bg-[#151A24]">
            <Td className="text-[#E7E9EE]">{o.symbol}</Td>
            <Td>
              <SideTag side={o.side} />
            </Td>
            <Td className="text-[#C7CCD6]">{o.type}</Td>
            <Td right className="text-[#C7CCD6]">
              {o.price.toLocaleString()}
            </Td>
            <Td right className="text-[#C7CCD6]">
              {o.size}
            </Td>
            <Td right className="text-[#7C8598]">
              {o.filled}
            </Td>
            <Td right className="text-[#7C8598]">
              {o.time}
            </Td>
            <Td right>
              <button className="rounded-[5px] border border-[#232A38] px-2.5 py-1 text-[11px] text-[#C7CCD6] transition-colors hover:border-[#F0555A] hover:text-[#F0555A]">
                Cancel
              </button>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OrderHistoryTable() {
  if (ORDER_HISTORY.length === 0)
    return <EmptyTable colSpan={6} label="No past orders" />;
  return (
    <table className="w-full">
      <thead className="border-b border-[#232A38]">
        <tr>
          <Th>Market</Th>
          <Th>Side</Th>
          <Th>Type</Th>
          <Th right>Price</Th>
          <Th right>Size</Th>
          <Th right>Status</Th>
          <Th right>Time</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#1A1F2B]">
        {ORDER_HISTORY.map((o, i) => (
          <tr key={i} className="hover:bg-[#151A24]">
            <Td className="text-[#E7E9EE]">{o.symbol}</Td>
            <Td>
              <SideTag side={o.side} />
            </Td>
            <Td className="text-[#C7CCD6]">{o.type}</Td>
            <Td right className="text-[#C7CCD6]">
              {o.price.toLocaleString()}
            </Td>
            <Td right className="text-[#C7CCD6]">
              {o.size}
            </Td>
            <Td
              right
              className={
                o.status === "Filled" ? "text-[#34D399]" : "text-[#7C8598]"
              }
            >
              {o.status}
            </Td>
            <Td right className="text-[#7C8598]">
              {o.time}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TradeHistoryTable() {
  if (TRADE_HISTORY.length === 0)
    return <EmptyTable colSpan={6} label="No trades yet" />;
  return (
    <table className="w-full">
      <thead className="border-b border-[#232A38]">
        <tr>
          <Th>Market</Th>
          <Th>Side</Th>
          <Th right>Price</Th>
          <Th right>Size</Th>
          <Th right>Fee</Th>
          <Th right>Time</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#1A1F2B]">
        {TRADE_HISTORY.map((t, i) => (
          <tr key={i} className="hover:bg-[#151A24]">
            <Td className="text-[#E7E9EE]">{t.symbol}</Td>
            <Td>
              <SideTag side={t.side} />
            </Td>
            <Td right className="text-[#C7CCD6]">
              {t.price.toLocaleString()}
            </Td>
            <Td right className="text-[#C7CCD6]">
              {t.size}
            </Td>
            <Td right className="text-[#7C8598]">
              {t.fee.toFixed(2)}
            </Td>
            <Td right className="text-[#7C8598]">
              {t.time}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmptyTable({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <table className="w-full">
      <tbody>
        <EmptyRow colSpan={colSpan} label={label} />
      </tbody>
    </table>
  );
}

export function PositionsPanel({ symbol }: { symbol: string }) {
  const [tab, setTab] = useState<Tab>("positions");

  const { data } = useQuery({
    queryKey: ["positions", symbol],
    queryFn: async () => {
      const res = await axios(
        `http://localhost:3000/positions/open/${symbol}`,
        { withCredentials: true },
      );
      return res.data.positions;
    },
  });
  const positions = data ?? [];

  return (
    <div className="flex flex-col rounded-[12px] border border-[#232A38] bg-[#12161F]">
      <div className="flex items-center gap-5 border-b border-[#232A38] px-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 py-3 font-mono text-[12px] transition-colors ${
              tab === t.key
                ? "border-[#F5A623] text-[#E7E9EE]"
                : "border-transparent text-[#7C8598] hover:text-[#E7E9EE]"
            }`}
          >
            {t.label}
            {t.key === "positions" && positions.length > 0 && (
              <span className="ml-1.5 text-[#F5A623]">{positions.length}</span>
            )}
            {t.key === "open" && OPEN_ORDERS.length > 0 && (
              <span className="ml-1.5 text-[#F5A623]">
                {OPEN_ORDERS.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        {tab === "positions" && <PositionsTable positions={positions} />}
        {tab === "open" && <OpenOrdersTable />}
        {tab === "history" && <OrderHistoryTable />}
        {tab === "trades" && <TradeHistoryTable />}
      </div>
    </div>
  );
}
