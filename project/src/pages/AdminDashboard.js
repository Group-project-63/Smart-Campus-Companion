// src/pages/AdminDashboard.js
import { Link } from "react-router-dom";
import useRole from "../hooks/useRole";

export default function AdminDashboard() {
  const role = useRole();
  if (role !== "admin") return <p style={{ padding: 16 }}>Not authorized</p>;
  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Dashboard</h2>
      <ul>
        <li><Link to="/admin/announcements">Manage Announcements</Link></li>
        <li><Link to="/admin/events">Manage Events</Link></li>
        <li><Link to="/admin/users">Manage User Roles</Link></li>
      </ul>
    </div>
  );
}