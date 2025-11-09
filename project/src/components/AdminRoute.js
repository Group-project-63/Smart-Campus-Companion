// src/components/AdminRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useRole from "../hooks/useRole";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const role = useRole();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;

  return children;
};
