// src/pages/Login.js
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, googleProvider } from "../services/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

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
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError(mapFirebaseAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setBusy(true);
      await signInWithPopup(auth, googleProvider);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError(mapFirebaseAuthError(err));
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

function mapFirebaseAuthError(err) {
  const code = err?.code || "";
  if (code.includes("user-not-found")) return "No user found with this email.";
  if (code.includes("wrong-password")) return "Incorrect password.";
  if (code.includes("invalid-email")) return "Invalid email.";
  if (code.includes("too-many-requests")) return "Too many attempts. Try again later.";
  return "Unable to sign in. Please try again.";
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