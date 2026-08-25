import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMe } from "../hooks/useme";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = useMe();
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      navigate("/signin", { replace: true });
    }
  }, [isError, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return null;
  }

  return <>{children}</>;
}
