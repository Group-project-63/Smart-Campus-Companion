import { useEffect, useMemo, useState } from "react";
import useRealtimeTable from "../hooks/useRealtimeTable";
import { supabase } from "../services/supabase";

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

export default function AdminGrades() {
  const [grades, loaded] = useRealtimeTable('grades', { select: '*', order: { column: 'created_at', ascending: false } });
  const loading = !loaded;

  const [students, setStudents] = useState([]);

  // Local UI state — create form
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [assignment, setAssignment] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [gradeText, setGradeText] = useState('');
  const [semester, setSemester] = useState('');

  // Editing
  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);

  // Delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Toast
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgTone, setMsgTone] = useState('info');
  const [msgText, setMsgText] = useState('');

  useEffect(() => {
    // Load users for student select
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.from('users').select('id, name, email').order('name', { ascending: true });
        if (error) throw error;
        if (mounted) setStudents(data || []);
      } catch (err) {
        console.error('Failed to load students', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const resetForm = () => {
    setStudentId(''); setCourse(''); setAssignment(''); setScore(''); setMaxScore(''); setGradeText(''); setSemester('');
  };

  const toasty = (text, tone = 'info') => {
    setMsgText(text); setMsgTone(tone); setMsgOpen(true);
  };

  const createGrade = async (e) => {
    e?.preventDefault();
    if (!studentId || !course) {
      toasty('Student and course are required', 'error');
      return;
    }
    try {
      const { error } = await supabase.from('grades').insert({
        student_id: studentId,
        course_code: course.trim(),
        assignment: assignment.trim() || null,
        score: score ? Number(score) : null,
        max_score: maxScore ? Number(maxScore) : null,
        grade: gradeText || null,
        semester: semester || null,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toasty('Grade added', 'success');
      resetForm();
    } catch (err) {
      console.error(err);
      toasty('Failed to add grade', 'error');
    }
  };

  const startEdit = (g) => {
    setEditDoc(g);
    setStudentId(g.student_id || '');
    setCourse(g.course_code || '');
    setAssignment(g.assignment || '');
    setScore(g.score != null ? String(g.score) : '');
    setMaxScore(g.max_score != null ? String(g.max_score) : '');
    setGradeText(g.grade || '');
    setSemester(g.semester || '');
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editDoc) return;
    try {
      const { error } = await supabase.from('grades').update({
        student_id: studentId,
        course_code: course.trim(),
        assignment: assignment.trim() || null,
        score: score ? Number(score) : null,
        max_score: maxScore ? Number(maxScore) : null,
        grade: gradeText || null,
        semester: semester || null,
      }).eq('id', editDoc.id);
      if (error) throw error;
      toasty('Grade updated', 'success');
      setEditOpen(false);
      setEditDoc(null);
    } catch (err) {
      console.error(err);
      toasty('Failed to update grade', 'error');
    }
  };

  const askDelete = (id) => { setDeleteId(id); setConfirmOpen(true); };
  const doDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('grades').delete().eq('id', deleteId);
      if (error) throw error;
      toasty('Deleted', 'success');
    } catch (err) {
      console.error(err);
      toasty('Failed to delete', 'error');
    } finally {
      setConfirmOpen(false); setDeleteId(null);
    }
  };

  const displayName = (id) => {
    const u = students.find((s) => s.id === id);
    return u ? (u.name || u.email || '(anonymous)') : id;
  };

  const filtered = useMemo(() => grades || [], [grades]);

  return (
    <div style={ui.page}>
      <div style={ui.headerRow}>
        <h2 style={{ margin: 0 }}>Manage Grades</h2>
      </div>

      <div style={ui.card}>
        <h3 style={ui.cardTitle}>Add Grade</h3>
        <form onSubmit={createGrade} style={ui.formGrid}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={ui.input}>
              <option value="">Select student</option>
              {students.map((s) => (
                <option value={s.id} key={s.id}>{s.name || s.email}</option>
              ))}
            </select>
            <input placeholder="Course (e.g. CS101)" value={course} onChange={(e) => setCourse(e.target.value)} style={ui.input} />
            <input placeholder="Assignment" value={assignment} onChange={(e) => setAssignment(e.target.value)} style={ui.input} />
          </div>

          <div style={ui.row}>
            <input placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} style={ui.input} />
            <input placeholder="Max Score" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} style={ui.input} />
            <input placeholder="Grade (A, B, etc.)" value={gradeText} onChange={(e) => setGradeText(e.target.value)} style={ui.input} />
            <input placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} style={ui.input} />
            <button type="submit" style={ui.btnPrimary}>Add</button>
          </div>
        </form>
      </div>

      <div style={{ ...ui.card, marginTop: 16 }}>
        <h3 style={ui.cardTitle}>Grades</h3>
        {loading ? (
          <p>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#64748b' }}>No grades found.</p>
        ) : (
          <div style={ui.grid}>
            {filtered.map((g) => (
              <div key={g.id} style={ui.card}>
                <div style={ui.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={ui.itemTitle}>{g.course_code} — {g.assignment || 'Assessment'}</div>
                    <div style={ui.metaRow}>
                      <span style={{ fontSize: 13, color: '#475569' }}>{displayName(g.student_id)}</span>
                      <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 8 }}>{g.score != null && g.max_score != null ? `${g.score}/${g.max_score}` : '—'}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>{g.grade || '—'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(g)} style={ui.btnWarning}>Edit</button>
                    <button onClick={() => askDelete(g.id)} style={ui.btnDanger}>Delete</button>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#334155' }}>{g.semester ? `Semester: ${g.semester}` : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit grade"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditOpen(false)} style={ui.btnSecondary}>Cancel</button>
            <button onClick={saveEdit} style={ui.btnPrimary}>Save</button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={ui.input}>
            <option value="">Select student</option>
            {students.map((s) => (
              <option value={s.id} key={s.id}>{s.name || s.email}</option>
            ))}
          </select>
          <input placeholder="Course" value={course} onChange={(e) => setCourse(e.target.value)} style={ui.input} />
          <input placeholder="Assignment" value={assignment} onChange={(e) => setAssignment(e.target.value)} style={ui.input} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} style={ui.input} />
            <input placeholder="Max score" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} style={ui.input} />
            <input placeholder="Grade" value={gradeText} onChange={(e) => setGradeText(e.target.value)} style={ui.input} />
          </div>
          <input placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} style={ui.input} />
        </div>
      </Modal>

      <Confirm open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={doDelete} message="Delete this grade? This cannot be undone." />

      <Toast open={msgOpen} tone={msgTone} onClose={() => setMsgOpen(false)}>{msgText}</Toast>

    </div>
  );
}

const ui = {
  page: { padding: 16, fontFamily: 'system-ui, Arial', background: '#f8fafc', minHeight: '100vh' },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' },
  cardTitle: { margin: '0 0 8px 0', fontSize: '16px' },
  cardHeader: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 },
  itemTitle: { fontSize: 16, fontWeight: 700, color: '#111827' },
  metaRow: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  formGrid: { display: 'grid', gap: 10 },
  input: { padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 160, flex: 1 },
  grid: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' },
  btnPrimary: { padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  btnSecondary: { padding: '8px 12px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  btnWarning: { padding: '6px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  btnDanger: { padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },

  // Modal + Toast styles copied/trimmed
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 },
  modal: { width: 'min(640px, 100%)', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 },
  modalFooter: { marginTop: 12 },
  iconBtn: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18 },
  iconBtnSmall: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#0f172a' },
  toastBase: { position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 10, alignItems: 'center', borderRadius: 10, padding: '10px 12px', border: '1px solid', zIndex: 60, boxShadow: '0 6px 20px rgba(0,0,0,0.15)', maxWidth: '80vw' },
  toastInfo: { background: '#eff6ff', color: '#1e3a8a', borderColor: '#bfdbfe' },
  toastSuccess: { background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' },
  toastError: { background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' },
};
