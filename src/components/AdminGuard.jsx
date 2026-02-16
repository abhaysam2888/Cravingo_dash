import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminGuard() {
  const { isAuth, loading } = useSelector((state) => state.auth);

  if (loading) return <p className="text-white">Checking authorization...</p>;
  if (!isAuth) return <Navigate to="/" replace />;

  return <Outlet />;
}
