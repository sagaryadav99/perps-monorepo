import { Link } from "react-router-dom";

const SYMBOLS = [
  { s: "BTC-PERP", p: 96421.5, d: 1 },
  { s: "ETH-PERP", p: 3512.8, d: -1 },
  { s: "SOL-PERP", p: 178.42, d: 1 },
  { s: "ARB-PERP", p: 0.812, d: -1 },
  { s: "AVAX-PERP", p: 41.06, d: 1 },
  { s: "OP-PERP", p: 2.14, d: -1 },
];

function TickerTape() {
  const row = [...SYMBOLS, ...SYMBOLS];
  return (
    <div className="w-full overflow-hidden border-y border-[#232A38] bg-[#0D1119]">
      <div className="flex w-max animate-[ticker_28s_linear_infinite] gap-10 py-3">
        {row.map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-2 whitespace-nowrap px-2 font-mono text-[13px]"
          >
            <span className="text-[#7C8598]">{it.s}</span>
            <span className={it.d > 0 ? "text-[#34D399]" : "text-[#F0555A]"}>
              {it.p.toLocaleString(undefined, {
                minimumFractionDigits: it.p < 10 ? 3 : 2,
              })}
            </span>
            <span className={it.d > 0 ? "text-[#34D399]" : "text-[#F0555A]"}>
              {it.d > 0 ? "▲" : "▼"}
            </span>
          </div>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

export function Home() {
  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-semibold tracking-tight text-[#E7E9EE]">
          Slash<span className="text-[#F5A623]">Perps</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="text-[13px] font-medium text-[#C7CCD6] transition-colors hover:text-[#E7E9EE]"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-[7px] bg-[#F5A623] px-4 py-2 text-[13px] font-semibold text-[#0A0E14] transition-opacity hover:opacity-90"
          >
            Create account
          </Link>
        </div>
      </header>

      <section className="px-6 pb-16 pt-10 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#232A38] bg-[#12161F] px-3 py-1 font-mono text-[11px] text-[#7C8598]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
            Perpetual futures · up to 50x
          </div>
          <h1 className="text-[40px] font-semibold leading-[1.1] tracking-tight text-[#E7E9EE] sm:text-[56px]">
            Trade the book,
            <br />
            not the noise.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#7C8598] sm:text-[16px]">
            Deep liquidity, sub-second fills, and a matching engine built for
            traders who watch the depth, not the headlines.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/signup"
              className="rounded-[7px] bg-[#F5A623] px-6 py-3 text-[14px] font-semibold text-[#0A0E14] transition-opacity hover:opacity-90"
            >
              Start trading
            </Link>
            <Link
              to="/signin"
              className="rounded-[7px] border border-[#232A38] bg-transparent px-6 py-3 text-[14px] font-semibold text-[#E7E9EE] transition-colors hover:border-[#3A4256]"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      <TickerTape />

      <footer className="border-t border-[#232A38] px-6 py-8">
        <p className="text-center font-mono text-[11px] text-[#4B5566]">
          SlashPerps — demo UI, not financial advice.
        </p>
      </footer>
    </div>
  );
}
