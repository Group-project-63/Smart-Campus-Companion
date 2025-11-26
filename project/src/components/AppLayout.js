import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/SearchBar";
import { useState } from "react";

export default function AppLayout() {
  const { user: currentUser, isAdmin, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      console.log("🔓 Starting logout...");
      await logout();
      console.log("✅ Logout successful");
      // Force navigation to login
      window.location.href = "/login";
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Even on error, force redirect
      window.location.href = "/login";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.left}>
          {/* ✅ Home button visible on all pages */}
          <Link to="/" style={styles.homeBtn}>🏠 Home</Link>

          {/* Optional quick links */}
          <nav style={styles.nav}>
            <Link to="/timetable" style={styles.link}>Timetable</Link>
            <Link to="/events" style={styles.link}>Events</Link>
            <Link to="/notes" style={styles.link}>Notes</Link>
            <Link to="/announcements" style={styles.link}>Announcements</Link>
            <Link to="/map" style={styles.link}>Map</Link>
            <Link to="/profile" style={styles.link}>Profile</Link>
            {isAdmin && <Link to="/admindashboard" style={styles.link}>Admin</Link>}
          </nav>
        </div>

        <div style={styles.right}>
          <div style={styles.searchWrap}>
            <SearchBar placeholder="Search events, announcements, notes…" />
          </div>

          {/* User + Logout */}
          <span style={styles.userText}>
            {currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "User"}
          </span>
          <button 
            type="button" 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            style={{
              ...styles.logoutBtn,
              opacity: isLoggingOut ? 0.6 : 1,
              cursor: isLoggingOut ? "not-allowed" : "pointer",
            }}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      {/* Page content */}
      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 16px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  left: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  homeBtn: {
    textDecoration: "none",
    padding: "8px 12px",
    background: "#111827",
    color: "#fff",
    borderRadius: 8,
    fontWeight: 600,
  },
  nav: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  link: { textDecoration: "none", color: "#374151", padding: "6px 8px", borderRadius: 6 },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0, // allow search to shrink instead of overflowing
  },
  searchWrap: {
    flex: 1,
    minWidth: 200,
    maxWidth: 520,
  },
  userText: { fontSize: 14, color: "#475569", whiteSpace: "nowrap" },
  logoutBtn: {
    padding: "6px 10px",
    background: "#ef4444",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
};
