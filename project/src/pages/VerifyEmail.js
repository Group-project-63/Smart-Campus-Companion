// src/pages/VerifyEmail.js
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmail() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");

  const resend = async () => {
    setMsg("");
    try {
      await sendEmailVerification(user);
      setMsg("Verification email sent again. Check your inbox/spam.");
    } catch (err) {
      setMsg(err?.message || "Failed to resend.");
    }
  };

  const refresh = async () => {
    await user.reload(); // refresh user object from Firebase
    setMsg(user.emailVerified ? "Email is verified ✅" : "Still not verified ❌");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Verify your email</h2>
      <p>We’ve sent a verification link to <b>{user?.email}</b>.</p>
      {msg && <p>{msg}</p>}
      <button onClick={resend} style={{ marginRight: 8 }}>Resend verification</button>
      <button onClick={refresh}>Refresh status</button>
    </div>
  );
}