// src/pages/Signup.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";

// ⬇️ Firestore imports
import { db } from "../services/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

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
    // Create the user doc only if it doesn't exist yet
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: nameOverride || user.displayName || "",
        email: user.email,
        role: "student",           // default; can promote to 'admin' manually later
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);

    try {
      setBusy(true);

      // 1) Create auth user
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // 2) Update display name
      await updateProfile(cred.user, { displayName: form.name });

      // 3) Create Firestore user profile
      await ensureUserProfile(cred.user, form.name);

      // 4) Send verification email (optional but recommended)
      await sendEmailVerification(cred.user);

      // 5) Navigate to verify page (remove duplicate navigate)
      navigate("/verify-email");
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
      const cred = await signInWithPopup(auth, googleProvider);

      // Create Firestore user profile for Google users too
      await ensureUserProfile(cred.user);

      // If you want to require verification for Google, skip this:
      // (Google accounts are typically already verified by provider.)
      navigate("/");
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

function mapFirebaseAuthError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "Email already in use.";
  if (code.includes("invalid-email")) return "Invalid email.";
  if (code.includes("weak-password")) return "Password is too weak.";
  if (code.includes("popup-closed-by-user")) return "Google popup closed. Try again.";
  return "Something went wrong. Please try again.";
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