import { useQuery } from "@tanstack/react-query";
import axios from "axios";
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await axios.get("http://localhost:3000/me", {
        withCredentials: true,
      });
      console.log(data);
      return data;
    },
    retry: false,
  });
}
