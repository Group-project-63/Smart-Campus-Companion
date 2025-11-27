// src/pages/Profile.js
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import GradesList from "../components/GradesList";
import useRole from "../hooks/useRole";

export default function Profile() {
  const { user } = useAuth();
  const role = useRole();
  const isAdmin = role === "admin";
  const [dept, setDept] = useState("");
  const [year, setYear] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase.from("users").select("dept, year").eq("id", user.id).limit(1).single();
        if (error) throw error;
        const d = data || {};
        setDept(d.dept || "");
        setYear(d.year ? String(d.year) : "");
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    })();
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      const updates = {
        dept: dept || null,
        year: year ? Number(year) : null,
      };
      const { error } = await supabase.from("users").update(updates).eq("id", user.id);
      if (error) throw error;
      setMsg("✓ Profile updated successfully!");
      setMsgType("success");
    } catch (err) {
      setMsg("Failed: " + (err?.message || "unknown error"));
      setMsgType("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Profile Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>👤 Your Profile</h2>
        </div>
        
        {msg && (
          <div style={msgType === "success" ? styles.successMsg : styles.errorMsg}>
            {msg}
          </div>
        )}

        <form onSubmit={save} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{ ...styles.input, backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={user?.user_metadata?.full_name || ""}
              disabled
              style={{ ...styles.input, backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Department</label>
              <select 
                value={dept} 
                onChange={(e) => setDept(e.target.value)} 
                disabled={!isAdmin}
                style={{
                  ...styles.input, 
                  ...(isAdmin ? {} : { backgroundColor: "#f3f4f6", cursor: "not-allowed" })
                }}
              >
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Year</label>
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                disabled={!isAdmin}
                style={{
                  ...styles.input, 
                  ...(isAdmin ? {} : { backgroundColor: "#f3f4f6", cursor: "not-allowed" })
                }}
              >
                <option value="">Select Year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            {isAdmin ? (
              <button type="submit" disabled={busy} style={styles.primaryBtn}>
                {busy ? "Saving..." : "💾 Save Profile"}
              </button>
            ) : (
              <div style={styles.readOnlyNotice}>
                📖 View-only: Students cannot edit profile settings. Contact an admin to make changes.
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Grades Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🧾 My Grades</h2>
        </div>
        
        <p style={styles.description}>Your recorded assessments and scores.</p>

        {user ? (
          <div style={{ marginTop: 16 }}>
            <GradesList />
          </div>
        ) : (
          <div style={styles.emptyState}>Please sign in to view your grades.</div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "24px",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  },
  section: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f1f5f9",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  description: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "0px",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    fontFamily: "system-ui, Arial",
    transition: "border-color 0.2s",
  },
  buttonGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "20px",
  },
  primaryBtn: {
    padding: "12px 16px",
    background: "#000000ff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  dangerBtn: {
    padding: "12px 16px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  successMsg: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontWeight: 600,
  },
  errorMsg: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontWeight: 600,
  },
  emptyState: {
    padding: "24px",
    textAlign: "center",
    background: "#f8fafc",
    borderRadius: "8px",
    color: "#64748b",
    fontSize: "14px",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #000000ff 0%, #000000ff 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    boxShadow: "0 6px 18px rgba(102,126,234,0.25)",
  },
  readOnlyNotice: {
    gridColumn: "1 / -1",
    padding: "12px 16px",
    background: "#fef3c7",
    border: "1px solid #fcd34d",
    color: "#92400e",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "center",
  },
};