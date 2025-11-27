import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import "./Timetable.css";
import { useLocation } from 'react-router-dom';

export default function Timetable() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    start: "09:00",
    end: "10:00",
    room: ""
  });

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const dateParam = params.get('date');
  const filteredItems = dateParam ? items.filter((it) => it.date === dateParam) : items;

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase.from("timetables").select("items").eq("id", user.id).limit(1).single();
        if (error && error.code !== "PGRST116") throw error;
        setItems(data?.items || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load timetable.");
      }
    })();
  }, [user]);

  const addSlot = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!user) return setError("You must be logged in.");

    const slot = { ...form };

    try {
      setBusy(true);
      // upsert timetables row (id = user.id)
      const { data, error } = await supabase
        .from("timetables")
        .select("items")
        .eq("id", user.id)
        .limit(1)
        .single();

      if (!data) {
        const { error: insErr } = await supabase.from("timetables").insert({ id: user.id, owner_uid: user.id, items: [slot], updated_at: new Date().toISOString() });
        if (insErr) throw insErr;
      } else {
        const nextItems = [...(data.items || []), slot];
        const { error: updErr } = await supabase.from("timetables").update({ items: nextItems, updated_at: new Date().toISOString() }).eq("id", user.id);
        if (updErr) throw updErr;
      }
      setItems((prev) => [...prev, slot]);
      setForm({ title: "", date: "", start: "09:00", end: "10:00", room: "" });
      setSuccess("✓ Timetable slot added and saved to database!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save timetable.");
    } finally {
      setBusy(false);
    }
  };

  const removeSlot = async (index) => {
    if (!user) return setError("You must be logged in.");
    const next = items.filter((_, i) => i !== index);
    try {
      const { error } = await supabase.from("timetables").update({ items: next, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (error) throw error;
      setItems(next);
      setSuccess("✓ Timetable slot deleted from database!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete slot.");
    }
  };

  const updateSlot = async (index, updated) => {
    if (!user) return setError("You must be logged in.");
    const next = items.map((it, i) => (i === index ? { ...it, ...updated } : it));
    try {
      const { error } = await supabase.from("timetables").update({ items: next, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (error) throw error;
      setItems(next);
      setSuccess("✓ Timetable slot updated and saved to database!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update slot.");
    }
  };

  const [editingIndex, setEditingIndex] = useState(null);
  const [edit, setEdit] = useState({ title: "", date: "", start: "", end: "", room: "" });

  const startEdit = (idx) => {
    const it = items[idx];
    setEditingIndex(idx);
    setEdit({ ...it });
  };
  const cancelEdit = () => {
    setEditingIndex(null);
    setEdit({ title: "", date: "", start: "", end: "", room: "" });
  };
  const saveEdit = async () => {
    await updateSlot(editingIndex, edit);
    cancelEdit();
  };

  return (
    <div className="timetable-container">
      <h2 className="heading">Your Timetable{dateParam ? ` — ${dateParam}` : ''}</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Add Slot Form */}
      <form onSubmit={addSlot} className="timetable-form">
        <input placeholder="Course/Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
        {filteredItems.map((it, idx) => (
          <div key={idx} className="slot-card">
            {editingIndex === idx ? (
              <div className="edit-form">
                <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
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
                <strong>{it.title}</strong> — {it.date} {it.start}-{it.end} ({it.room})
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