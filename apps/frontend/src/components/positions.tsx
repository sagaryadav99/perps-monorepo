// components/positions-panel.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { API_URL } from "../config";
type Tab = "positions" | "open" | "history" | "trades";

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

function OpenOrdersTable({ symbol }: { symbol: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["openOrders", symbol],
    queryFn: async () => {
      const res = await axios(`${API_URL}/orders/open/${symbol}`, {
        withCredentials: true,
      });

      return res.data.orders;
    },
  });

  const orders = data ?? [];

  if (isLoading) {
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
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              <Td>
                <div className="h-3 w-10 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td>
                <div className="h-3 w-12 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td>
                <div className="h-3 w-12 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-16 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-10 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-10 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-20 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-6 w-14 animate-pulse rounded-[5px] bg-[#232A38]" />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (error) {
    return <div>Failed to load orders</div>;
  }

  if (orders.length === 0)
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
        {orders.map((o: any) => (
          <tr key={o.id} className="hover:bg-[#151A24]">
            <Td className="text-[#E7E9EE]">{o.market_id}</Td>

            <Td>
              <SideTag side={o.type.toLowerCase()} />
            </Td>

            <Td className="text-[#C7CCD6]">{o.orderType}</Td>

            <Td right className="text-[#C7CCD6]">
              {Number(o.price).toLocaleString()}
            </Td>

            <Td right className="text-[#C7CCD6]">
              {Number(o.qty)}
            </Td>

            <Td right className="text-[#7C8598]">
              {Number(o.filledQty)}
            </Td>

            <Td right className="text-[#7C8598]">
              {new Date(o.createdAt).toLocaleTimeString()}
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

function OrderHistoryTable({ symbol }: { symbol: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orderHistory", symbol],
    queryFn: async () => {
      const res = await axios(`${API_URL}/orders/${symbol}`, {
        withCredentials: true,
      });

      return res.data.allorders;
    },
  });

  const orders = data ?? [];

  if (isLoading) {
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
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              <Td>
                <div className="h-3 w-10 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td>
                <div className="h-3 w-12 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td>
                <div className="h-3 w-12 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-16 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-10 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-16 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-20 animate-pulse rounded bg-[#232A38]" />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (error) {
    return <div>Failed to load order history</div>;
  }

  if (orders.length === 0) {
    return <EmptyTable colSpan={7} label="No past orders" />;
  }

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
        {orders.map((o: any) => (
          <tr key={o.id} className="hover:bg-[#151A24]">
            <Td className="text-[#E7E9EE]">{o.market_id}</Td>

            <Td>
              <SideTag side={o.type.toLowerCase()} />
            </Td>

            <Td className="text-[#C7CCD6]">{o.orderType}</Td>

            <Td right className="text-[#C7CCD6]">
              {Number(o.price).toLocaleString()}
            </Td>

            <Td right className="text-[#C7CCD6]">
              {Number(o.qty)}
            </Td>

            <Td right>{o.status}</Td>

            <Td right className="text-[#7C8598]">
              {new Date(o.createdAt).toLocaleString()}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TradeHistoryTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tradeHistory"],
    queryFn: async () => {
      const res = await axios(`${API_URL}/trades`, {
        withCredentials: true,
      });
      return res.data.trades;
    },
  });
  const trades = data ?? [];

  if (isLoading) {
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
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              <Td>
                <div className="h-3 w-10 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td>
                <div className="h-3 w-12 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-16 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-10 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-12 animate-pulse rounded bg-[#232A38]" />
              </Td>

              <Td right>
                <div className="ml-auto h-3 w-20 animate-pulse rounded bg-[#232A38]" />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (error) {
    return <div>Failed to load trade history</div>;
  }

  if (trades.length === 0) {
    return <EmptyTable colSpan={6} label="No trades yet" />;
  }

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
        {trades.map((t: any) => (
          <tr key={t.id} className="hover:bg-[#151A24]">
            <Td className="text-[#E7E9EE]">{t.market}</Td>

            <Td>
              <SideTag side={t.side.toLowerCase()} />
            </Td>

            <Td right className="text-[#C7CCD6]">
              {Number(t.price).toLocaleString()}
            </Td>

            <Td right className="text-[#C7CCD6]">
              {Number(t.qty)}
            </Td>

            <Td right className="text-[#7C8598]">
              {t.fee ?? "-"}
            </Td>

            <Td right className="text-[#7C8598]">
              {new Date(t.createdAt).toLocaleString()}
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
      const res = await axios(`${API_URL}/positions/open/${symbol}`, {
        withCredentials: true,
      });
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
            {t.key === "open"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        {tab === "positions" && <PositionsTable positions={positions} />}
        {tab === "open" && <OpenOrdersTable symbol={symbol} />}
        {tab === "history" && <OrderHistoryTable symbol={symbol} />}
        {tab === "trades" && <TradeHistoryTable />}
      </div>
    </div>
  );
}
