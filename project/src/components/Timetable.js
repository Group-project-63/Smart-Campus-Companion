// src/components/Timetable.js
import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Timetable() {
  const { user } = useAuth();

  // State for existing items and the add form
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    day: "Mon",
    start: "09:00",
    end: "10:00",
    room: ""
  });

  // ✅ 1) Load the timetable document for the current user (doc id = user.uid)
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "timetables", user.uid);
    getDoc(ref)
      .then((snap) => setItems(snap.exists() ? snap.data().items || [] : []))
      .catch((err) => setError(err.message));
  }, [user]);

  // ✅ 2) Add a new slot
  const addSlot = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return setError("You must be logged in.");

    const ref = doc(db, "timetables", user.uid);
    const slot = { ...form };

    try {
      setBusy(true);
      const current = await getDoc(ref);
      if (!current.exists()) {
        await setDoc(ref, {
          ownerUid: user.uid,
          items: [slot],
          updatedAt: new Date()
        });
      } else {
        await updateDoc(ref, {
          items: arrayUnion(slot),
          updatedAt: new Date()
        });
      }
      setItems((prev) => [...prev, slot]);
      setForm({ title: "", day: "Mon", start: "09:00", end: "10:00", room: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save timetable.");
    } finally {
      setBusy(false);
    }
  };

  // ⬇️ ✅ 3) PLACE YOUR HANDLERS HERE (inside the component, after state/hooks)

  // Remove a slot by index
  const removeSlot = async (index) => {
    if (!user) return setError("You must be logged in.");
    const ref = doc(db, "timetables", user.uid);
    const next = items.filter((_, i) => i !== index);
    try {
      await updateDoc(ref, { items: next, updatedAt: new Date() });
      setItems(next);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete slot.");
    }
  };

  // Update a slot by index with partial fields (e.g., { title, day, start, end, room })
  const updateSlot = async (index, updated) => {
    if (!user) return setError("You must be logged in.");
    const ref = doc(db, "timetables", user.uid);
    const next = items.map((it, i) => (i === index ? { ...it, ...updated } : it));
    try {
      await updateDoc(ref, { items: next, updatedAt: new Date() });
      setItems(next);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update slot.");
    }
  };

  // Helper to toggle edit UI (simple inline edit)
  const [editingIndex, setEditingIndex] = useState(null);
  const [edit, setEdit] = useState({ title: "", day: "Mon", start: "", end: "", room: "" });

  const startEdit = (idx) => {
    const it = items[idx];
    setEditingIndex(idx);
    setEdit({ ...it });
  };
  const cancelEdit = () => {
    setEditingIndex(null);
    setEdit({ title: "", day: "Mon", start: "", end: "", room: "" });
  };
  const saveEdit = async () => {
    await updateSlot(editingIndex, edit);
    cancelEdit();
  };

  // ✅ 4) Render
  return (
    <div style={{ padding: 16 }}>
      <h2>Your Timetable</h2>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      {/* Add form */}
      <form onSubmit={addSlot} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input
          placeholder="Course/Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label>Start</label>
            <input
              type="time"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
            <label>End</label>
            <input
              type="time"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </div>
        </div>
        <input
          placeholder="Room"
          value={form.room}
          onChange={(e) => setForm({ ...form, room: e.target.value })}
        />
        <button disabled={busy} type="submit">
          {busy ? "Adding..." : "Add Slot"}
        </button>
      </form>

      {/* List */}
      <ul style={{ marginTop: 16 }}>
        {items.map((it, idx) => (
          <li key={idx} style={{ marginBottom: 10 }}>
            {editingIndex === idx ? (
              // Inline edit UI
              <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
                <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={edit.day} onChange={(e) => setEdit({ ...edit, day: e.target.value })}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={edit.start}
                    onChange={(e) => setEdit({ ...edit, start: e.target.value })}
                  />
                  <input
                    type="time"
                    value={edit.end}
                    onChange={(e) => setEdit({ ...edit, end: e.target.value })}
                  />
                </div>
                <input value={edit.room} onChange={(e) => setEdit({ ...edit, room: e.target.value })} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveEdit}>Save</button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Read-only view
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span>
                  <b>{it.title}</b> — {it.day} {it.start}-{it.end} ({it.room})
                </span>
                <button type="button" onClick={() => startEdit(idx)}>
                  Edit
                </button>
                <button type="button" onClick={() => removeSlot(idx)}>
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}