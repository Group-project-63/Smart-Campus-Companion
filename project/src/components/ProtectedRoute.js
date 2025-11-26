import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // Show timeout warning after 5 seconds of loading
    if (loading) {
      const timer = setTimeout(() => setShowTimeout(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Handle logout redirect - when currentUser becomes null and we're not loading
  useEffect(() => {
    if (!loading && !currentUser) {
      console.log("ProtectedRoute: User logged out, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>Loading...</div>
        {showTimeout && (
          <div style={{ marginTop: "20px", color: "#ef4444" }}>
            <p>This is taking longer than expected.</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: "10px 20px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}