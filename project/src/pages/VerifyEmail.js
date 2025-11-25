// src/pages/VerifyEmail.js
import { useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const { currentUser } = useAuth();
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    setMsg("");
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const u = data?.user;
      const verified = !!(u?.email_confirmed_at || u?.confirmed_at || u?.email_verified);
      setMsg(verified ? "Email is verified ✅" : "Still not verified ❌");
    } catch (err) {
      setMsg(err?.message || "Failed to refresh status.");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Verify your email</h2>
      <p>We've sent a verification link to <b>{currentUser?.email || "(email)"}</b>.</p>
      {msg && <p>{msg}</p>}
      <div style={{ backgroundColor: "#fffbea", border: "1px solid #fde68a", padding: 12, borderRadius: 8, marginTop: 12, marginBottom: 12 }}>
        <p style={{ margin: 0 }}><strong>Next steps:</strong></p>
        <ol>
          <li>Check your email (including spam/junk folder)</li>
          <li>Click the verification link in the email</li>
          <li>Return here and click "Refresh status" to confirm</li>
        </ol>
      </div>
      <button onClick={refresh} style={{ padding: "10px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
        Refresh status
      </button>
    </div>
  );
}