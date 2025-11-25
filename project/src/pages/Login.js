// src/pages/Login.js
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email.");
    if (!form.password) return setError("Password is required.");

    try {
      setBusy(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) {
        // Check if error is due to unconfirmed email
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          // Allow proceeding to verify page
          navigate("/verify-email", { replace: true });
          return;
        }
        throw error;
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setBusy(true);
      // Trigger OAuth redirect for Google
      await supabase.auth.signInWithOAuth({ provider: "google" });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Welcome back</h2>
        {error && <div style={styles.error}>{error}</div>}

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} style={styles.input} />

        <label>Password</label>
        <div style={{ position: "relative" }}>
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />
          <button type="button" onClick={() => setShowPwd((s) => !s)} style={styles.eyeBtn}>
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>

        <button disabled={busy} type="submit" style={styles.primaryBtn}>
          {busy ? "Signing in..." : "Log In"}
        </button>

        <button disabled={busy} type="button" onClick={handleGoogle} style={styles.secondaryBtn}>
          Continue with Google
        </button>
        <p style={{ marginTop: 8 }}>
          <button type="button" onClick={() => navigate('/reset-password')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>
              Forgot password?
          </button>
        </p>

        <p style={{ marginTop: 12 }}>
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}

function mapAuthError(err) {
  if (!err) return "Unable to sign in. Please try again.";
  const msg = err?.message || err?.error_description || err?.status || "";
  const code = err?.code || "";
  if (msg && typeof msg === "string") {
    if (msg.toLowerCase().includes("email not confirmed")) return "Email not confirmed. Please verify your email first.";
    if (msg.toLowerCase().includes("invalid credentials") || msg.toLowerCase().includes("invalid login credentials")) return "Incorrect email or password.";
    if (msg.toLowerCase().includes("user not found")) return "No user found with this email.";
    if (msg.toLowerCase().includes("invalid email")) return "Invalid email.";
  }
  if (code.includes("user-not-found")) return "No user found with this email.";
  if (code.includes("wrong-password")) return "Incorrect password.";
  if (code.includes("invalid-email")) return "Invalid email.";
  return msg || "Unable to sign in. Please try again.";
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  card: { width: "100%", maxWidth: 420, border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" },
  input: { width: "100%", padding: "10px 12px", marginBottom: 12, borderRadius: 8, border: "1px solid #d1d5db" },
  primaryBtn: { width: "100%", padding: "10px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", marginTop: 6 },
  secondaryBtn: { width: "100%", padding: "10px 12px", background: "#f3f4f6", color: "#111827", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", marginTop: 8 },
  error: { background: "#fee2e2", color: "#b91c1c", padding: 10, borderRadius: 8, marginBottom: 12, border: "1px solid #fecaca" },
  eyeBtn: { position: "absolute", right: 8, top: 8, border: "none", background: "transparent", cursor: "pointer", color: "#2563eb" },
};