import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useFetchBook({ symbol }: { symbol: string }) {
  return useQuery({
    queryKey: ["book", symbol],
    queryFn: async () => {
      const { data } = await axios(`http://localhost:3000/getDepth/${symbol}`, {
        withCredentials: true,
      });
      return data;
    },
    retry: false,
  });
}
