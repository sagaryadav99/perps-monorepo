import { useNavigate } from "react-router-dom";
import { useMe } from "../hooks/useme";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useMe();
  const navigate = useNavigate();
  if (isError) {
    navigate("/signin");
  }
  return <>{children}</>;
}
