import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { logout, currentUser } = useAuth(); // If your AuthContext exposes 'user' instead, change to { user }
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e?.preventDefault?.();
    if (busy) return;
    setBusy(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setBusy(false);
    }
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
        <button
          type="button"
          onClick={handleLogout}
          disabled={busy}
          style={{
            padding: "6px 10px",
            marginLeft: 12,
            borderRadius: 6,
            border: "1px solid #ddd",
            background: busy ? "#f4f4f4" : "#fff",
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Logging out..." : "Logout"}
        </button>
      )}
    </nav>
  );
}
