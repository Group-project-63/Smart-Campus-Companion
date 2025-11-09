// src/components/Navbar.js
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const out = async () => { await logout(); navigate("/login"); };

  return (
    <header style={{ display: "flex", gap: 16, alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #e5e7eb" }}>
      <Link to="/">🏫 Smart Campus</Link>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/timetable">Timetable</Link>
        <Link to="/events">Events</Link>
        <Link to="/map">Map</Link>
        <Link to="/notes">Notes</Link>
        <Link to="/announcements">Announcements</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <span>{user?.displayName || user?.email}</span>
        <button onClick={out} style={{ padding: "6px 10px", background: "#ef4444", color: "#fff", border: 0, borderRadius: 6 }}>Logout</button>
      </div>
    </header>
  );
}