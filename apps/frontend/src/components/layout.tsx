import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div
      className="min-h-screen
     bg-[#0A0E14] w-full text-[#E7E9EE]"
    >
      <Outlet />
    </div>
  );
}
