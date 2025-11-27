import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Navbar logout failed:", err);
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
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid #eee",
        background: "#fafafa",
      }}
    >
      <span style={{ fontWeight: 600 }}>Smart Campus Companion</span>

      {/* Always render the search bar on protected pages */}
      <div style={{ flex: 1, maxWidth: 520, marginLeft: "auto" }}>
        <SearchBar placeholder="Search events, announcements, notes…" />
      </div>

      {currentUser && (
        <div style={{ position: "relative" }}>
          {/* Circular User Profile Icon */}
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
              boxShadow: menuOpen ? "0 0 12px rgba(102, 126, 234, 0.4)" : "none",
            }}
            title={currentUser?.user_metadata?.full_name || currentUser?.email}
          >
            {getUserInitials()}
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                minWidth: 200,
                zIndex: 101,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* User Info */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                  {currentUser?.user_metadata?.full_name || "User"}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: 4 }}>
                  {currentUser?.email}
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <button
                  onClick={handleProfileClick}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#334155",
                    fontWeight: 500,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  👤 View Profile
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#ef4444",
                    fontWeight: 600,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#fff7f7")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}

          {/* Close menu when clicking outside */}
          {menuOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
              }}
              onClick={() => setMenuOpen(false)}
            />
          )}
        </div>
      )}
    </nav>
  );
}
