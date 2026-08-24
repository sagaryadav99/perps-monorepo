import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../config";
export function useFetchBook({ symbol }: { symbol: string }) {
  return useQuery({
    queryKey: ["book", symbol],
    queryFn: async () => {
      const { data } = await axios(`${API_URL}/getDepth/${symbol}`, {
        withCredentials: true,
      });
      return data;
    },
    retry: false,
  });
}
