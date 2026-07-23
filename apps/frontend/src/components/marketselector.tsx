// components/market-selector.tsx
import { useNavigate, useParams } from "react-router-dom";

const MARKETS = ["SOL", "ETH"];

export function MarketSelector() {
  const { symbol = "SOL" } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {MARKETS.map((m) => (
        <button
          key={m}
          onClick={() => navigate(`/dashboard/${m}`)}
          className={`whitespace-nowrap rounded-[6px] px-3 py-1.5 font-mono text-[12px] transition-colors ${
            m === symbol
              ? "bg-[#1E2530] text-[#E7E9EE]"
              : "text-[#7C8598] hover:text-[#E7E9EE]"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
