import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import { Signup } from "./components/signup";
import { Signin } from "./components/signin";
import { Dashboard } from "./components/dashboard";
import { Home } from "./components/home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "./components/dashboardLayout";
import { ProtectedRoute } from "./components/protectedRoute";
const queryclient = new QueryClient();
export default function App() {
  return (
    <div>
      <QueryClientProvider client={queryclient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard/:symbol" element={<Dashboard />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}
