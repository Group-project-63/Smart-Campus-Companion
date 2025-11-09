// src/pages/AdminAnnouncements.js
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export default function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dept, setDept] = useState("");    // e.g. "CSE", "ECE", "ME", "" (all)
  const [year, setYear] = useState("");    // e.g. "1", "2", "3", "4", "" (all)
  const [msg, setMsg] = useState("");

  const publish = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!title.trim() || !body.trim()) return setMsg("Title and body are required.");
    try {
      await addDoc(collection(db, "announcements"), {
        title,
        body,
        audience: { dept: dept || null, year: year ? Number(year) : null },
        publishedAt: serverTimestamp(),
      });
      setMsg("Announcement published.");
      setTitle(""); setBody(""); setDept(""); setYear("");
    } catch (err) {
      setMsg("Failed: " + (err?.message || "unknown error"));
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin: Publish Announcement</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={publish} style={{ display: "grid", gap: 8, maxWidth: 600 }}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} rows={5} />
        <div style={{ display: "flex", gap: 8 }}>
          <select value={dept} onChange={e=>setDept(e.target.value)}>
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>
          <select value={year} onChange={e=>setYear(e.target.value)}>
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>
        <button type="submit">Publish</button>
      </form>
    </div>
  );
}