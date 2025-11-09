// src/pages/ResetPassword.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email.");
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Reset link sent. Check your inbox.");
    } catch (error) {
      setErr(error?.message || "Failed to send reset email.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 420, border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, background: "#fff" }}>
        <h2>Password Reset</h2>
        {msg && <div style={{ background: "#ecfdf5", color: "#065f46", padding: 10, borderRadius: 8, marginBottom: 12 }}>{msg}</div>}
        {err && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 10, borderRadius: 8, marginBottom: 12 }}>{err}</div>}
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px", marginBottom: 12, borderRadius: 8, border: "1px solid #d1d5db" }}/>
        <button type="submit" style={{ width: "100%", padding: "10px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8 }}>Send reset link</button>
        <button type="button" onClick={()=>navigate('/login')} style={{ width: "100%", padding: "10px 12px", marginTop: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}>Back to login</button>
      </form>
    </div>
  );
}