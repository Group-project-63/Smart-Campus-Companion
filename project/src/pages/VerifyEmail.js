// src/pages/VerifyEmail.js
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    setMsg("Checking email status...");
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const u = data?.user;
      const verified = !!(u?.email_confirmed_at || u?.confirmed_at || u?.email_verified);
      
      if (verified) {
        setMsg("Email is verified ✅");
        console.log("Email verified, redirecting to login...");
        // Redirect to login after 2 seconds to show the success message
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setMsg("Still not verified ❌");
      }
    } catch (err) {
      setMsg(err?.message || "Failed to refresh status.");
    }
  };

  // Check email status on component mount
  useEffect(() => {
    const checkEmailStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        const u = data?.user;
        const verified = !!(u?.email_confirmed_at || u?.confirmed_at || u?.email_verified);
        
        if (verified) {
          setMsg("Email is verified ✅");
          console.log("Email already verified, redirecting to login...");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        }
      } catch (err) {
        console.error("Error checking email status:", err);
      }
    };
    
    checkEmailStatus();
  }, [navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Verify your email</h2>
      <p>We've sent a verification link to <b>{currentUser?.email || "(email)"}</b>.</p>
      {msg && <p style={{ fontSize: 16, fontWeight: msg.includes("✅") ? "bold" : "normal", color: msg.includes("✅") ? "#22c55e" : "#ef4444" }}>{msg}</p>}
      <div style={{ backgroundColor: "#fffbea", border: "1px solid #fde68a", padding: 12, borderRadius: 8, marginTop: 12, marginBottom: 12 }}>
        <p style={{ margin: 0 }}><strong>Next steps:</strong></p>
        <ol>
          <li>Check your email (including spam/junk folder)</li>
          <li>Click the verification link in the email</li>
          <li>Return here and click "Refresh status" to confirm</li>
        </ol>
      </div>
      <button 
        onClick={refresh} 
        style={{ 
          padding: "10px 16px", 
          background: "#2563eb", 
          color: "#fff", 
          border: "none", 
          borderRadius: 6, 
          cursor: "pointer", 
          fontSize: 14,
          fontWeight: 600
        }}
      >
        Refresh status
      </button>
      {msg.includes("✅") && (
        <p style={{ marginTop: 12, fontSize: 14, color: "#666" }}>
          Redirecting to login page in 2 seconds...
        </p>
      )}
    </div>
  );
}