import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./Timetable.css";

export default function Timetable() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    day: "Mon",
    date: "",
    start: "09:00",
    end: "10:00",
    room: ""
  });

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "timetables", user.uid);
    getDoc(ref)
      .then((snap) => setItems(snap.exists() ? snap.data().items || [] : []))
      .catch((err) => setError(err.message));
  }, [user]);

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
      setForm({ title: "", day: "Mon", date: "", start: "09:00", end: "10:00", room: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save timetable.");
    } finally {
      setBusy(false);
    }
  };

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

  const [editingIndex, setEditingIndex] = useState(null);
  const [edit, setEdit] = useState({ title: "", day: "Mon", date: "", start: "", end: "", room: "" });

  const startEdit = (idx) => {
    const it = items[idx];
    setEditingIndex(idx);
    setEdit({ ...it });
  };
  const cancelEdit = () => {
    setEditingIndex(null);
    setEdit({ title: "", day: "Mon", date: "", start: "", end: "", room: "" });
  };
  const saveEdit = async () => {
    await updateSlot(editingIndex, edit);
    cancelEdit();
  };

  return (
    <div className="timetable-container">
      <h2 className="heading">Your Timetable</h2>
      {error && <p className="error">{error}</p>}

      {/* Add Slot Form */}
      <form onSubmit={addSlot} className="timetable-form">
        <input placeholder="Course/Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <div className="time-inputs">
          <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
        </div>
        <input placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
        <button className="primary-btn" disabled={busy}>{busy ? "Adding..." : "Add Slot"}</button>
      </form>

      {/* Timetable List */}
      <div className="timetable-list">
        {items.map((it, idx) => (
          <div key={idx} className="slot-card">
            {editingIndex === idx ? (
              <div className="edit-form">
                <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
                <select value={edit.day} onChange={(e) => setEdit({ ...edit, day: e.target.value })}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} />
                <input type="time" value={edit.start} onChange={(e) => setEdit({ ...edit, start: e.target.value })} />
                <input type="time" value={edit.end} onChange={(e) => setEdit({ ...edit, end: e.target.value })} />
                <input value={edit.room} onChange={(e) => setEdit({ ...edit, room: e.target.value })} />
                <div className="actions">
                  <button className="primary-btn" onClick={saveEdit}>Save</button>
                  <button className="cancel-btn" type="button" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="slot-info">
                <strong>{it.title}</strong> — {it.day}, {it.date} {it.start}-{it.end} ({it.room})
                <div className="actions">
                  <button className="edit-btn" onClick={() => startEdit(idx)}>Edit</button>
                  <button className="delete-btn" onClick={() => removeSlot(idx)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}