// src/pages/AdminDashboard.js
import { Link } from "react-router-dom";
import useRole from "../hooks/useRole";

export default function AdminDashboard() {
  const role = useRole();
  if (role !== "admin") {
    return (
      <div style={styles.notAuth}>
        <h2>403 – Not Authorized</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <span style={styles.badge}>Role: Admin</span>
      </header>

      <p style={styles.subtitle}>Manage campus resources and user roles.</p>

      <div style={styles.grid}>
        <Card
          to="/adminannouncements"
          icon="📢"
          title="Manage Announcements"
          desc="Create and edit campus announcements."
        />
        <Card
          to="/events"
          icon="📅"
          title="Manage Events"
          desc="Add or update campus events."
        />
        <Card
          to="/admingrades"
          icon="🧾"
          title="Manage Grades"
          desc="Record and manage student grades."
        />
        <Card
          to="/users"
          icon="👥"
          title="Manage User Roles"
          desc="Assign admin or student roles."
        />
      </div>
    </div>
  );
}

function Card({ to, icon, title, desc }) {
  return (
    <Link to={to} style={styles.card}>
      <div style={styles.cardIcon}>{icon}</div>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardDesc}>{desc}</div>
    </Link>
  );
}

const styles = {
  page: {
    padding: "24px",
    fontFamily: "system-ui, Arial",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: { fontSize: "28px", fontWeight: 700, color: "#111827" },
  badge: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 600,
    border: "1px solid #c7d2fe",
  },
  subtitle: { fontSize: "16px", color: "#374151", marginBottom: "24px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  card: {
    display: "block",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    transition: "transform 0.1s ease, box-shadow 0.2s ease",
  },
  cardIcon: { fontSize: "28px", marginBottom: "8px" },
  cardTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "6px" },
  cardDesc: { fontSize: "13px", color: "#6b7280" },
  notAuth: { padding: "24px", textAlign: "center", color: "#ef4444" },
};