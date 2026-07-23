import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#232A38] px-4 py-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#7C8598]">
        {children}
      </span>
    </div>
  );
}
export function OrderFormPanel({ symbol }: { symbol: string }) {
  const [side, setSide] = useState<"long" | "short">("long");
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [leverage, setLeverage] = useState(1);
  const orderMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        "http://localhost:3000/order",
        {
          price: Number(price),
          qty: Number(size),
          type: orderType,
          market: symbol,
          side: side,
          leverage: leverage,
        },
        {
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: (data: any) => {
      console.log(data);
    },
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    orderMutation.mutate();
    // TODO: POST to your matching engine order endpoint
    // await api.post('/orders', { side, orderType, price, size, leverage })
  };

  return (
    <div className="flex h-full flex-col rounded-[12px] border border-[#232A38] bg-[#12161F]">
      <PanelHeader>Place order</PanelHeader>

      <div className="flex gap-2 px-4 pt-4">
        <button
          onClick={() => setSide("long")}
          className={`flex-1 rounded-[7px] py-2.5 font-mono text-[13px] font-semibold transition-colors ${
            side === "long"
              ? "bg-[#34D399] text-[#0A0E14]"
              : "border border-[#232A38] text-[#7C8598] hover:text-[#E7E9EE]"
          }`}
        >
          Long
        </button>
        <button
          onClick={() => setSide("short")}
          className={`flex-1 rounded-[7px] py-2.5 font-mono text-[13px] font-semibold transition-colors ${
            side === "short"
              ? "bg-[#F0555A] text-[#0A0E14]"
              : "border border-[#232A38] text-[#7C8598] hover:text-[#E7E9EE]"
          }`}
        >
          Short
        </button>
      </div>

      <div className="flex gap-4 px-4 pt-4 font-mono text-[12px]">
        {(["limit", "market"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`border-b-2 pb-1.5 capitalize transition-colors ${
              orderType === t
                ? "border-[#F5A623] text-[#E7E9EE]"
                : "border-transparent text-[#7C8598] hover:text-[#E7E9EE]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-1 flex-col gap-4 px-4 py-4">
        {orderType === "limit" && (
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#7C8598]">
              Price (USD)
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full no-spinner rounded-[7px] border border-[#232A38] bg-[#0D1119] px-3.5 py-2.5 font-mono text-[14px] text-[#E7E9EE] outline-none focus:border-[#F5A623]"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#7C8598]">
            Size ({symbol})
          </span>
          <input
            type="number"
            value={size}
            min={0}
            onChange={(e) => setSize(e.target.value)}
            placeholder="0.000"
            className="w-full no-spinner rounded-[7px] border border-[#232A38] bg-[#0D1119] px-3.5 py-2.5 font-mono text-[14px] text-[#E7E9EE] placeholder:text-[#4B5566] outline-none focus:border-[#F5A623]"
          />
        </label>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#7C8598]">
              Leverage
            </span>
            <span className="font-mono text-[12px] text-[#F5A623]">
              {leverage}x
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-[#F5A623]"
          />
        </div>

        <div className="mt-auto space-y-1.5 rounded-[8px] border border-[#232A38] bg-[#0D1119] px-3.5 py-3 font-mono text-[12px]">
          <div className="flex justify-between text-[#7C8598]">
            <span>Margin required</span>
            <span className="text-[#C7CCD6]">
              {size
                ? ((Number(size) * Number(price)) / leverage).toFixed(2)
                : "0.00"}{" "}
              USD
            </span>
          </div>
          <div className="flex justify-between text-[#7C8598]">
            <span>Liq. price (est.)</span>
            <span className="text-[#C7CCD6]">—</span>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full rounded-[7px] py-3 font-mono text-[14px] font-semibold text-[#0A0E14] transition-opacity hover:opacity-90 ${
            side === "long" ? "bg-[#34D399]" : "bg-[#F0555A]"
          }`}
        >
          {side === "long" ? "Open long" : "Open short"}
        </button>
      </form>
    </div>
  );
}
