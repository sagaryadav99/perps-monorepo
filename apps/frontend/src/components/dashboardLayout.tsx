import { Outlet } from "react-router-dom";
import { Header } from "./header";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
