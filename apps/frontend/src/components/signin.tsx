import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { API_URL } from "../config";
export function Signin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `${API_URL}/signin`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });
      navigate("/dashboard/SOL");
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      mutation.mutate();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex justify-center">
          <span className="font-semibold tracking-tight text-[#E7E9EE]">
            Slash<span className="text-[#F5A623]">Perps</span>
          </span>
        </div>

        <div className="rounded-[14px] border border-[#232A38] bg-[#12161F] p-7">
          <h1 className="mb-1 text-[20px] font-semibold text-[#E7E9EE]">
            Sign in
          </h1>
          <p className="mb-6 text-[13px] text-[#7C8598]">
            Enter your credentials to access your positions.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#7C8598]">
                Username
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="satoshi"
                autoFocus
                className="w-full rounded-[7px] border border-[#232A38] bg-[#0D1119] px-3.5 py-2.5 font-mono text-[14px] text-[#E7E9EE] placeholder:text-[#4B5566] outline-none focus:border-[#F5A623]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#7C8598]">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full rounded-[7px] border border-[#232A38] bg-[#0D1119] px-3.5 py-2.5 font-mono text-[14px] text-[#E7E9EE] placeholder:text-[#4B5566] outline-none focus:border-[#F5A623]"
              />
            </label>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 w-full rounded-[7px] bg-[#F5A623] py-2.5 text-[14px] font-semibold text-[#0A0E14] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {mutation.isPending ? "Signing in…" : "Sign in"}
            </button>
            {mutation.isError ? (
              <div className="text-center">
                <p className="mt-1.5 font-mono text-[11px] text-[#F0555A]">
                  {(mutation.error as AxiosError<{ message: string }>).response
                    ?.data?.message ?? "Something went wrong"}
                </p>
              </div>
            ) : null}
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-[#7C8598]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-[#F5A623] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
