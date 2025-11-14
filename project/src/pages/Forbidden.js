import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🚫</div>
        <h2 style={styles.title}>403 – Forbidden</h2>
        <p style={styles.message}>
          You don’t have permission to access this page.
        </p>
        <Link to="/" style={styles.homeBtn}>
          ⬅ Go Back Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    padding: "32px",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  icon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
  },
  message: {
    fontSize: "16px",
    color: "#4b5563",
    marginBottom: "24px",
  },
  homeBtn: {
    display: "inline-block",
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "600",
    transition: "background 0.2s ease",
  },
};