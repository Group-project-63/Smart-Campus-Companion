// src/pages/Home.js
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";

const Home = () => {
  const { user, loading } = useAuth();
  const { setScope } = useSearch();

  useEffect(() => {
    setScope("all");
  }, [setScope]);


  const prettyName =
    user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "") || "User";

  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>Smart Campus Companion</h1>
          <p style={styles.subtitle}>
            Manage your classes, events, notes, and campus info—all in one place.
          </p>
          <div style={styles.userInfo}>
            {loading ? (
              <span style={{color: '#ef4444'}}>Loading user… (if this takes too long, please refresh the page)</span>
            ) : (
              <>
                <span>Signed in as </span>
                <strong>{prettyName}</strong>
              </>
            )}
          </div>
        </div>
        <div style={styles.heroBadge}>🚀 MVP</div>
      </section>

      {/* Quick Actions */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.grid}>
          <Card to="/timetable" emoji="📘" title="Timetable" desc="View & manage your weekly schedule." />
          <Card to="/events" emoji="📅" title="Events" desc="See upcoming campus activities." />
          <Card to="/map" emoji="🗺️" title="Campus Map" desc="Find buildings and facilities." />
          <Card to="/notes" emoji="📄" title="Notes Upload" desc="Upload and access your notes." />
          <Card to="/grades" emoji="🧾" title="Grades" desc="View your course grades and assessments." />
          <Card to="/announcements" emoji="📢" title="Announcements" desc="Latest updates from campus." />
          <Card to="/profile" emoji="👤" title="Profile" desc="Set department/year for tailored info." />
          <Card to="/admindashboard" emoji="🛠️" title="Admin Dashboard" desc="Manage campus events and announcements." />
        </div>
      </section>
    </div>
  );
};

function Card({ to, emoji, title, desc }) {
  return (
    <Link to={to} style={styles.card}>
      <div style={styles.cardEmoji}>{emoji}</div>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardDesc}>{desc}</div>
    </Link>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)", padding: "24px" },
  hero: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    border: "1px solid #e5e7eb", background: "#ffffff", padding: "24px",
    borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.06)", marginBottom: "24px",
    position: "relative", overflow: "hidden",
  },
  heroContent: { maxWidth: "720px" },
  title: { fontSize: "28px", margin: 0, color: "#111827", fontWeight: 700 },
  subtitle: { fontSize: "16px", color: "#374151", marginTop: "8px" },
  userInfo: { marginTop: "10px", fontSize: "14px", color: "#4b5563" },
  heroBadge: {
    position: "absolute", right: "16px", top: "16px",
    background: "#eef2ff", color: "#3730a3", padding: "6px 10px",
    borderRadius: "999px", fontSize: "12px", fontWeight: 600, border: "1px solid #c7d2fe",
  },
  section: { marginTop: "8px" },
  sectionTitle: { fontSize: "20px", color: "#111827", marginBottom: "12px", fontWeight: 600 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
  card: {
    display: "block", border: "1px solid #e5e7eb", background: "#ffffff",
    borderRadius: "14px", padding: "16px", textDecoration: "none", color: "inherit",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)", transition: "transform 0.08s ease, box-shadow 0.2s ease",
  },
  cardEmoji: { fontSize: "24px", marginBottom: "8px" },
  cardTitle: { fontSize: "16px", fontWeight: 600, color: "#111827", marginBottom: "6px" },
  cardDesc: { fontSize: "13px", color: "#6b7280" },
  logoutBtn: {
    padding: "10px 16px", backgroundColor: "#ef4444", color: "#fff",
    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600,
  },
};

export default Home;