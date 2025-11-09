// src/pages/Profile.js
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Profile() {
  const { user } = useAuth();
  const [dept, setDept] = useState("");
  const [year, setYear] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(s => {
      const d = s.data() || {};
      setDept(d.dept || "");
      setYear(d.year ? String(d.year) : "");
    });
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        dept: dept || null,
        year: year ? Number(year) : null,
      });
      setMsg("Profile updated.");
    } catch (err) {
      setMsg("Failed: " + (err?.message || "unknown error"));
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Your Profile</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={save} style={{ display: "flex", gap: 8 }}>
        <select value={dept} onChange={e=>setDept(e.target.value)}>
          <option value="">Select Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
          <option value="CE">CE</option>
        </select>
        <select value={year} onChange={e=>setYear(e.target.value)}>
          <option value="">Select Year</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}