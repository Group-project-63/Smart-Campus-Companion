// src/pages/Signup.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

// We will store user profiles in the `users` table in Supabase (id = auth user id)

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  };

  const ensureUserProfile = async (user, nameOverride) => {
    // Create the user record only if it doesn't exist yet
    try {
      const { data: existing, error: selErr } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .limit(1)
        .single();
      if (!existing) {
        await supabase.from("users").insert({
          id: user.id,
          name: nameOverride || user.user_metadata?.full_name || user.email || "",
          email: user.email,
          role: "student",
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error("Failed ensureUserProfile:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);

    try {
      setBusy(true);

      // 1) Create auth user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });
      if (error) throw error;

      // 2) Create user profile row
      if (data?.user) {
        await ensureUserProfile(data.user, form.name);
      }

      // Supabase typically handles email confirmations automatically when enabled
      navigate("/verify-email");
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
      await supabase.auth.signInWithOAuth({ provider: "google" });
      // OAuth will redirect — after redirect the AuthContext listener will create profile row if needed
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
        <h2>Create your account</h2>
        {error && <div style={styles.error}>{error}</div>}

        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} style={styles.input} />

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

        <label>Confirm Password</label>
        <input
          name="confirm"
          type={showPwd ? "text" : "password"}
          value={form.confirm}
          onChange={handleChange}
          style={styles.input}
        />

        <button disabled={busy} type="submit" style={styles.primaryBtn}>
          {busy ? "Creating..." : "Sign Up"}
        </button>

        <button disabled={busy} type="button" onClick={handleGoogle} style={styles.secondaryBtn}>
          Continue with Google
        </button>

        <p style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

function mapAuthError(err) {
  if (!err) return "Something went wrong. Please try again.";
  const msg = err?.message || err?.error_description || "";
  const code = err?.code || "";
  if (msg.toLowerCase().includes("already registered") || code.includes("email-already-in-use")) return "Email already in use.";
  if (msg.toLowerCase().includes("invalid email") || code.includes("invalid-email")) return "Invalid email.";
  if (msg.toLowerCase().includes("weak password") || code.includes("weak-password")) return "Password is too weak.";
  if (msg.toLowerCase().includes("email not confirmed")) return "Please check your email and click the verification link.";
  if (code.includes("popup-closed-by-user") || msg.toLowerCase().includes("popup closed")) return "Google popup closed. Try again.";
  return msg || "Something went wrong. Please try again.";
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