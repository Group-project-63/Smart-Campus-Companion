import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/SearchBar";
import { useState } from "react";

export default function AppLayout() {
  const { user: currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async (e) => {
    e?.preventDefault?.();
    try {
      await logout();
      setMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getUserInitials = () => {
    if (currentUser?.user_metadata?.full_name) {
      return currentUser.user_metadata.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return currentUser?.email?.[0]?.toUpperCase() || "U";
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

          {/* Circular profile icon + dropdown */}
          {currentUser && (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "2px solid #667eea",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                title={currentUser?.user_metadata?.full_name || currentUser?.email}
              >
                {getUserInitials()}
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    minWidth: 180,
                    zIndex: 101,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{currentUser?.user_metadata?.full_name || "User"}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{currentUser?.email}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#334155",
                      }}
                    >
                      👤 View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}

              {menuOpen && (
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 100 }}
                  onClick={() => setMenuOpen(false)}
                />
              )}
            </div>
          )}
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
