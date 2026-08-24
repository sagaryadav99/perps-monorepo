import { useQuery } from "@tanstack/react-query";
import type { Candle } from "../components/candlechart";
import axios from "axios";
import { API_URL } from "../config";
export function useCandles(symbol: string, interval: string) {
  return useQuery<Candle[]>({
    queryKey: ["candles", symbol, interval],

    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/candles/${symbol}?interval=${interval}`,
        {
          withCredentials: true,
        },
      );

      return response.data;
    },
  });
}
