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
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) throw error;
      // Instantly navigate after successful login
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
      <div style={styles.wrapper}>
        {/* Left side - Student Illustration */}
        <div style={styles.imageSection}>
          <div style={styles.imagePlaceholder}>
            <svg style={styles.illustration} viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
              {/* Student illustration */}
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Head */}
              <circle cx="200" cy="100" r="45" fill="#f4a261" />
              {/* Hair */}
              <path d="M 155 70 Q 155 50 200 45 Q 245 50 245 70" fill="#8b6914" />
              {/* Shirt/Body */}
              <rect x="160" y="150" width="80" height="100" rx="10" fill="url(#grad1)" />
              {/* Arms */}
              <rect x="100" y="160" width="60" height="20" rx="10" fill="#f4a261" />
              <rect x="240" y="160" width="60" height="20" rx="10" fill="#f4a261" />
              {/* Books/Stack */}
              <rect x="260" y="210" width="60" height="80" fill="#dc2626" rx="5" />
              <rect x="260" y="200" width="60" height="15" fill="#991b1b" rx="5" />
              {/* Pants */}
              <rect x="165" y="250" width="30" height="80" fill="#1f2937" />
              <rect x="205" y="250" width="30" height="80" fill="#1f2937" />
              {/* Shoes */}
              <ellipse cx="180" cy="335" rx="15" ry="8" fill="#111827" />
              <ellipse cx="220" cy="335" rx="15" ry="8" fill="#111827" />
              {/* Smile */}
              <path d="M 190 120 Q 200 125 210 120" stroke="#111827" strokeWidth="2" fill="none" />
              {/* Eyes */}
              <circle cx="190" cy="95" r="3" fill="#111827" />
              <circle cx="210" cy="95" r="3" fill="#111827" />
            </svg>
          </div>
          <h3 style={styles.imageCaption}>Smart Campus</h3>
          <p style={styles.imageSubCaption}>Your learning companion</p>
        </div>

        {/* Right side - Login Form */}
        <form onSubmit={handleSubmit} style={styles.card}>
          <h2 style={styles.formTitle}>Welcome back</h2>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} style={styles.input} placeholder="your@email.com" />

          <label style={styles.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              name="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your password"
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
          
          <p style={{ marginTop: 8, textAlign: "center" }}>
            <button type="button" onClick={() => navigate('/reset-password')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>
                Forgot password?
            </button>
          </p>

          <p style={{ marginTop: 12, textAlign: "center", fontSize: "14px", color: "#666" }}>
            Don't have an account? <Link to="/signup" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Create one</Link>
          </p>
        </form>
      </div>
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
  container: { 
    minHeight: "100vh", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 16,
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
  },
  wrapper: {
    display: "flex",
    width: "100%",
    maxWidth: 900,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    background: "#fff"
  },
  imageSection: {
    display: "flex",
    flex: 1,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    minWidth: 350
  },
  imagePlaceholder: {
    width: "100%",
    maxWidth: 250,
    height: 300,
    marginBottom: 20
  },
  illustration: {
    width: "100%",
    height: "100%"
  },
  imageCaption: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: "center"
  },
  imageSubCaption: {
    fontSize: 16,
    opacity: 0.9,
    textAlign: "center"
  },
  card: {
    flex: 1,
    padding: 40,
    width: "100%",
    minWidth: 350
  },
  formTitle: {
    marginBottom: 24,
    color: "#111827",
    fontSize: 28,
    fontWeight: 700
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#374151"
  },
  input: { 
    width: "100%", 
    padding: "12px 12px", 
    marginBottom: 16, 
    borderRadius: 8, 
    border: "1px solid #d1d5db",
    fontSize: 14,
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    outline: "none"
  },
  primaryBtn: { 
    width: "100%", 
    padding: "12px 12px", 
    background: "#2563eb", 
    color: "#fff", 
    border: "none", 
    borderRadius: 8, 
    cursor: "pointer", 
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 600,
    fontSize: 15,
    transition: "background-color 0.2s",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
  },
  secondaryBtn: { 
    width: "100%", 
    padding: "12px 12px", 
    background: "#f3f4f6", 
    color: "#111827", 
    border: "1px solid #e5e7eb", 
    borderRadius: 8, 
    cursor: "pointer", 
    marginTop: 0,
    marginBottom: 8,
    fontWeight: 600,
    fontSize: 15,
    transition: "background-color 0.2s"
  },
  error: { 
    background: "#fee2e2", 
    color: "#b91c1c", 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 16, 
    border: "1px solid #fecaca",
    fontSize: 14,
    fontWeight: 500
  },
  eyeBtn: { 
    position: "absolute", 
    right: 12, 
    top: 12, 
    border: "none", 
    background: "transparent", 
    cursor: "pointer", 
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 600
  },
};
