import { useState } from "react";
import { useMe } from "../hooks/useme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function Header() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useMe();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState("");
  const balanceUpdate = useMutation({
    mutationFn: async (amount: string) => {
      const { data } = await axios.post(
        "http://localhost:3000/onramp",
        {
          amount: Number(amount),
        },
        {
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], (old: any) => ({
        ...old,
        balance: data.totalAmount,
      }));
    },
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const username = data?.username ?? "";
  const balance = data?.balance ?? 0;
  const submitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    balanceUpdate.mutate(amount);
    // TODO: POST to your deposit/wallet endpoint
    // await api.post('/wallet/deposit', { amount })
    setShowAddFunds(false);
    setAmount("");
  };
  return (
    <>
      <header className="flex items-center justify-between border-b border-[#232A38] bg-[#0A0E14] px-4 py-3">
        <span className="font-semibold tracking-tight text-[#E7E9EE]">
          Slash<span className="text-[#F5A623]">Perps</span>
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-[8px] border border-[#232A38] bg-[#12161F] px-3.5 py-1.5">
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#7C8598]">
                Wallet balance
              </div>
              <div className="font-mono text-[13px] font-semibold text-[#E7E9EE]">
                $
                {balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <button
              onClick={() => setShowAddFunds(true)}
              className="rounded-[6px] bg-[#F5A623] px-3 py-1.5 font-mono text-[12px] font-semibold text-[#0A0E14] transition-opacity hover:opacity-90"
            >
              + Add funds
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-[8px] border border-[#232A38] bg-[#12161F] px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E2530] font-mono text-[11px] text-[#C7CCD6]">
              {username[0].toUpperCase()}
            </div>
            <span className="font-mono text-[13px] text-[#E7E9EE]">
              {username}
            </span>
          </div>
        </div>
      </header>

      {showAddFunds && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"
          onClick={() => setShowAddFunds(false)}
        >
          <div
            className="w-full max-w-[360px] rounded-[14px] border border-[#232A38] bg-[#12161F] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-[18px] font-semibold text-[#E7E9EE]">
              Add funds
            </h2>
            <p className="mb-5 text-[13px] text-[#7C8598]">
              Deposit into your wallet to open new positions.
            </p>

            <form onSubmit={submitDeposit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#7C8598]">
                  Amount (USD)
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  className="w-full no-spinner rounded-[7px] border border-[#232A38] bg-[#0D1119] px-3.5 py-2.5 font-mono text-[14px] text-[#E7E9EE] placeholder:text-[#4B5566] outline-none focus:border-[#F5A623]"
                />
              </label>

              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v.toString())}
                    className="flex-1 rounded-[6px] border border-[#232A38] py-1.5 font-mono text-[12px] text-[#C7CCD6] transition-colors hover:border-[#F5A623] hover:text-[#F5A623]"
                  >
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 rounded-[7px] border border-[#232A38] py-2.5 font-mono text-[13px] text-[#C7CCD6] transition-colors hover:border-[#3A4256]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-[7px] bg-[#F5A623] py-2.5 font-mono text-[13px] font-semibold text-[#0A0E14] transition-opacity hover:opacity-90"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
