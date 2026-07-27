import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function PriceTicker({ symbol }: { symbol: string }) {
  const { data } = useQuery({
    queryKey: ["price", symbol],
    queryFn: () => "",
    enabled: false,
    initialData: "",
  });
  const prevPrice = useRef(Number(data));
  let color = Number(data) > prevPrice.current ? `[#34D399]` : `[#F0555A]`;
  useEffect(() => {
    prevPrice.current = Number(data);
  }, [data]);
  return <p className={`text-${color} text-[18px]`}>{data}</p>;
}
