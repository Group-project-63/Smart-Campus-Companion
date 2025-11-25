// src/pages/AdminEvents.js
import { useMemo, useState } from "react";
import useRealtimeTable from "../hooks/useRealtimeTable";
import { supabase } from "../services/supabase";

/** ---------- Small UI Primitives (Modal, Confirm, Toast) ---------- */
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div style={ui.backdrop} onClick={onClose}>
      <div style={ui.modal} onClick={(e) => e.stopPropagation()}>
        <div style={ui.modalHeader}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={ui.iconBtn} aria-label="Close">✕</button>
        </div>
        <div style={{ marginTop: 8 }}>{children}</div>
        {footer && <div style={ui.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

function Confirm({ open, onCancel, onConfirm, message }) {
  if (!open) return null;
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Confirm delete"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={ui.btnSecondary}>Cancel</button>
          <button onClick={onConfirm} style={ui.btnDanger}>Delete</button>
        </div>
      }
    >
      <p style={{ margin: 0 }}>{message}</p>
    </Modal>
  );
}

function Toast({ open, tone = "info", children, onClose }) {
  if (!open) return null;
  const toneStyle =
    tone === "success" ? ui.toastSuccess :
    tone === "error" ? ui.toastError : ui.toastInfo;
  return (
    <div style={{ ...ui.toastBase, ...toneStyle }}>
      <div>{children}</div>
      <button onClick={onClose} style={ui.iconBtnSmall}>✕</button>
    </div>
  );
}

/** ---------- Main Page ---------- */
export default function AdminEvents() {
  // Form state (create)
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // Data (realtime)
  const [events, eventsLoaded] = useRealtimeTable("events", { select: "*", order: { column: "date", ascending: true } });
  const loading = !eventsLoaded;

  // UI state
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgTone, setMsgTone] = useState("info");
  const [msgText, setMsgText] = useState("");

  // Filters/Search
  const [qText, setQText] = useState("");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const toasty = (text, tone = "info") => {
    setMsgText(text);
    setMsgTone(tone);
    setMsgOpen(true);
  };

  const resetCreateForm = () => {
    setTitle("");
    setDate("");
    setDescription("");
  };

  /** Create */
  const onPublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      toasty("Title and date are required.", "error");
      return;
    }
    try {
      const { error } = await supabase.from("events").insert({
        title: title.trim(),
        date: date,
        description: description.trim(),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toasty("Event created.", "success");
      resetCreateForm();
    } catch (err) {
      console.error(err);
      toasty("Failed to create event. Try again.", "error");
    }
  };

  /** Open edit modal */
  const startEdit = (e) => {
    setEditDoc(e);
    setEditTitle(e.title || "");
    setEditDate(e.date || "");
    setEditDescription(e.description || "");
    setEditOpen(true);
  };

  /** Save edit */
  const saveEdit = async () => {
    if (!editDoc) return;
    if (!editTitle.trim() || !editDate) {
      toasty("Title and date are required.", "error");
      return;
    }
    try {
      const { error } = await supabase.from("events").update({
        title: editTitle.trim(),
        date: editDate,
        description: editDescription.trim(),
      }).eq("id", editDoc.id);
      if (error) throw error;
      toasty("Event updated.", "success");
      setEditOpen(false);
      setEditDoc(null);
    } catch (err) {
      console.error(err);
      toasty("Failed to update.", "error");
    }
  };

  /** Confirm delete */
  const askDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", deleteId);
      if (error) throw error;
      toasty("Event deleted.", "success");
    } catch (err) {
      console.error(err);
      toasty("Failed to delete.", "error");
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  /** UI helpers */
  const formatDate = (d) => {
    if (!d) return "—";
    try {
      const date = new Date(d);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "—";
    }
  };

  const filtered = useMemo(() => {
    const t = qText.trim().toLowerCase();
    return events.filter((e) => {
      const matchesText =
        !t ||
        e.title?.toLowerCase().includes(t) ||
        e.description?.toLowerCase().includes(t);
      return matchesText;
    });
  }, [events, qText]);

  return (
    <div style={ui.page}>
      <div style={ui.headerRow}>
        <h2 style={{ margin: 0 }}>Manage Events</h2>
      </div>

      {/* Create Form Card */}
      <div style={ui.card}>
        <h3 style={ui.cardTitle}>Create New Event</h3>
        <form onSubmit={onPublish} style={ui.formGrid}>
          <input
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={ui.input}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={ui.input}
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...ui.input, resize: "vertical" }}
          />

          <div style={ui.row}>
            <button type="submit" style={ui.btnPrimary}>
              Create Event
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div style={{ ...ui.card, marginTop: 16 }}>
        <h3 style={ui.cardTitle}>Search</h3>
        <div style={ui.row}>
          <input
            placeholder="Search title/description…"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            style={ui.input}
          />
          <button
            type="button"
            onClick={() => setQText("")}
            style={ui.btnSecondary}
          >
            Clear
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div style={ui.card}>
            <div style={ui.skeletonTitle} />
            <div style={ui.skeletonText} />
            <div style={ui.skeletonText} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={ui.card}>
            <p style={{ margin: 0, color: "#64748b" }}>No events found.</p>
          </div>
        ) : (
          <div style={ui.grid}>
            {filtered.map((e) => (
              <div key={e.id} style={ui.card}>
                <div style={ui.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={ui.itemTitle}>{e.title}</div>
                    <div style={ui.metaRow}>
                      <span style={ui.metaMuted}>
                        📅 {formatDate(e.date)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(e)} style={ui.btnWarning}>Edit</button>
                    <button onClick={() => askDelete(e.id)} style={ui.btnDanger}>Delete</button>
                  </div>
                </div>
                {e.description && <div style={ui.bodyText}>{e.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Event"
        footer={
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setEditOpen(false)} style={ui.btnSecondary}>Cancel</button>
            <button onClick={saveEdit} style={ui.btnPrimary}>Save</button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 10 }}>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={ui.input}
            placeholder="Title"
          />
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            style={ui.input}
          />
          <textarea
            rows={4}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            style={{ ...ui.input, resize: "vertical" }}
            placeholder="Description"
          />
        </div>
      </Modal>

      {/* Delete confirm */}
      <Confirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
        message="Delete this event? This cannot be undone."
      />

      {/* Toast */}
      <Toast
        open={msgOpen}
        tone={msgTone}
        onClose={() => setMsgOpen(false)}
      >
        {msgText}
      </Toast>
    </div>
  );
}

/** ---------- Styles ---------- */
const ui = {
  page: {
    padding: 16,
    fontFamily: "system-ui, Arial",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  grid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  cardTitle: { margin: "0 0 8px 0", fontSize: "16px" },
  cardHeader: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemTitle: { fontSize: 16, fontWeight: 700, color: "#111827" },
  bodyText: { whiteSpace: "pre-wrap", color: "#334155" },
  metaRow: { display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap" },
  metaMuted: { fontSize: 12, color: "#94a3b8" },

  row: { display: "flex", gap: 8, flexWrap: "wrap" },
  formGrid: { display: "grid", gap: 10 },

  input: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    minWidth: 160,
    flex: 1,
  },

  btnPrimary: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnSecondary: {
    padding: "8px 12px",
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnWarning: {
    padding: "6px 10px",
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnDanger: {
    padding: "6px 10px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  // Modal
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16,
  },
  modal: {
    width: "min(640px, 100%)",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 6,
  },
  modalFooter: { marginTop: 12 },

  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
  },
  iconBtnSmall: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
    color: "#0f172a",
  },

  // Toast
  toastBase: {
    position: "fixed",
    bottom: 16,
    right: 16,
    display: "flex",
    gap: 10,
    alignItems: "center",
    borderRadius: 10,
    padding: "10px 12px",
    border: "1px solid",
    zIndex: 60,
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
    maxWidth: "80vw",
  },
  toastInfo:  { background: "#eff6ff", color: "#1e3a8a", borderColor: "#bfdbfe" },
  toastSuccess:{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" },
  toastError:  { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" },

  // Skeletons
  skeletonTitle: {
    width: "60%",
    height: 18,
    background: "#e5e7eb",
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonText: {
    width: "100%",
    height: 12,
    background: "#e5e7eb",
    borderRadius: 6,
    marginBottom: 6,
  },
};
