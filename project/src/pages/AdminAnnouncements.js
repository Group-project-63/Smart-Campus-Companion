// src/pages/AdminAnnouncements.js
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
export default function AdminAnnouncements() {
  // Form state (create)
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dept, setDept] = useState(""); // "", "CSE", "ECE", "ME", "CE"
  const [year, setYear] = useState(""); // "", "1" | "2" | "3" | "4"

  // Data (realtime)
  const [announcements, announcementsLoaded] = useRealtimeTable("announcements", { select: "*", order: { column: "published_at", ascending: false } });
  const loading = !announcementsLoaded;

  // UI state
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgTone, setMsgTone] = useState("info");
  const [msgText, setMsgText] = useState("");

  // Filters/Search
  const [qText, setQText] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editYear, setEditYear] = useState("");

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
    setBody("");
    setDept("");
    setYear("");
  };

  /** Create */
  const onPublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toasty("Title and body are required.", "error");
      return;
    }
    try {
      const { error } = await supabase.from("announcements").insert({
        title: title.trim(),
        body: body.trim(),
        audience: { dept: dept || null, year: year ? Number(year) : null },
        published_at: new Date().toISOString(),
      });
      if (error) throw error;
      toasty("Announcement published.", "success");
      resetCreateForm();
    } catch (err) {
      console.error(err);
      toasty("Failed to publish. Try again.", "error");
    }
  };

  /** Open edit modal */
  const startEdit = (a) => {
    setEditDoc(a);
    setEditTitle(a.title || "");
    setEditBody(a.body || "");
    setEditDept(a.audience?.dept || "");
    setEditYear(
      a.audience?.year != null ? String(a.audience.year) : ""
    );
    setEditOpen(true);
  };

  /** Save edit */
  const saveEdit = async () => {
    if (!editDoc) return;
    if (!editTitle.trim() || !editBody.trim()) {
      toasty("Title and body are required.", "error");
      return;
    }
    try {
      const { error } = await supabase.from("announcements").update({
        title: editTitle.trim(),
        body: editBody.trim(),
        audience: { dept: editDept || null, year: editYear ? Number(editYear) : null },
        updated_at: new Date().toISOString(),
      }).eq("id", editDoc.id);
      if (error) throw error;
      toasty("Announcement updated.", "success");
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
      const { error } = await supabase.from("announcements").delete().eq("id", deleteId);
      if (error) throw error;
      toasty("Announcement deleted.", "success");
    } catch (err) {
      console.error(err);
      toasty("Failed to delete.", "error");
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  /** UI helpers */
  const formatTS = (ts) => {
    try {
      // Accept Firestore Timestamp or ISO string
      if (!ts) return "—";
      let d = null;
      if (ts?.toDate) d = ts.toDate();
      else d = new Date(ts);
      return d && !isNaN(d.getTime()) ? d.toLocaleString() : "—";
    } catch {
      return "—";
    }
  };

  const filtered = useMemo(() => {
    const t = qText.trim().toLowerCase();
    return announcements.filter((a) => {
      const matchesText =
        !t ||
        a.title?.toLowerCase().includes(t) ||
        a.body?.toLowerCase().includes(t);

      const matchesDept =
        !filterDept || (a.audience?.dept || "") === filterDept;

      const matchesYear =
        !filterYear ||
        String(a.audience?.year ?? "") === String(filterYear);

      return matchesText && matchesDept && matchesYear;
    });
  }, [announcements, qText, filterDept, filterYear]);

  return (
    <div style={ui.page}>
      <div style={ui.headerRow}>
        <h2 style={{ margin: 0 }}>Manage Announcements</h2>
      </div>

      {/* Create Form Card */}
      <div style={ui.card}>
        <h3 style={ui.cardTitle}>Create New</h3>
        <form onSubmit={onPublish} style={ui.formGrid}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={ui.input}
          />
          <textarea
            placeholder="Body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ ...ui.input, resize: "vertical" }}
          />

          <div style={ui.row}>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              style={ui.input}
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={ui.input}
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>

            <button type="submit" style={ui.btnPrimary}>
              Publish
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div style={{ ...ui.card, marginTop: 16 }}>
        <h3 style={ui.cardTitle}>Search & Filters</h3>
        <div style={ui.row}>
          <input
            placeholder="Search title/body…"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            style={ui.input}
          />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={ui.input}
          >
            <option value="">Dept: All</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={ui.input}
          >
            <option value="">Year: All</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setQText("");
              setFilterDept("");
              setFilterYear("");
            }}
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
            <p style={{ margin: 0, color: "#64748b" }}>No announcements found.</p>
          </div>
        ) : (
          <div style={ui.grid}>
            {filtered.map((a) => {
              const d = a.audience || {};
              return (
                <div key={a.id} style={ui.card}>
                  <div style={ui.cardHeader}>
                    <div style={{ flex: 1 }}>
                      <div style={ui.itemTitle}>{a.title}</div>
                      <div style={ui.metaRow}>
                        <Chip label={d.dept || "All Dept"} />
                        <Chip label={d.year != null ? `Year ${d.year}` : "All Years"} />
                        <span style={ui.metaMuted}>
                          {a.updated_at ? "Updated: " + formatTS(a.updated_at) : "Published: " + formatTS(a.published_at)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => startEdit(a)} style={ui.btnWarning}>Edit</button>
                      <button onClick={() => askDelete(a.id)} style={ui.btnDanger}>Delete</button>
                    </div>
                  </div>
                  <div style={ui.bodyText}>{a.body}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Announcement"
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
          <textarea
            rows={5}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            style={{ ...ui.input, resize: "vertical" }}
            placeholder="Body"
          />
          <div style={ui.row}>
            <select
              value={editDept}
              onChange={(e) => setEditDept(e.target.value)}
              style={ui.input}
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>
            <select
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              style={ui.input}
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Confirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
        message="Delete this announcement? This cannot be undone."
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

/** ---------- Small Chips ---------- */
function Chip({ label }) {
  return (
    <span style={ui.chip}>
      {label}
    </span>
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

  chip: {
    display: "inline-block",
    padding: "2px 8px",
    fontSize: 12,
    borderRadius: 999,
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#475569",
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