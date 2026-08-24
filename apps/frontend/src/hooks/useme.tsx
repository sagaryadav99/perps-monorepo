import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../config";
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/me`, {
        withCredentials: true,
      });
      console.log(data);
      return data;
    },
    retry: false,
  });
}
