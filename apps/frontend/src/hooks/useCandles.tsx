import { useQuery } from "@tanstack/react-query";
import type { Candle } from "../components/candlechart";
import axios from "axios";

export function useCandles(symbol: string, interval: string) {
  return useQuery<Candle[]>({
    queryKey: ["candles", symbol, interval],

    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:3000/candles/${symbol}?interval=${interval}`,
        {
          withCredentials: true,
        },
      );

      return response.data;
    },
  });
}
