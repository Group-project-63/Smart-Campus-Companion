import React from 'react';
import useRealtimeTable from '../hooks/useRealtimeTable';
import { useAuth } from '../context/AuthContext';

export default function GradesList() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const [grades, loaded] = useRealtimeTable('grades', { match: { column: 'student_id', value: userId }, order: { column: 'created_at', ascending: false } });

  if (!userId) return <p>Please sign in to view your grades.</p>;
  if (!loaded) return <p>Loading grades…</p>;

  if (!grades || grades.length === 0) return <p>No grades available yet.</p>;

  const pct = (g) => {
    try {
      if (!g?.score || !g?.max_score) return '—';
      return Math.round((Number(g.score) / Number(g.max_score)) * 100) + '%';
    } catch { return '—'; }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <h3>Your Grades</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th style={{ padding: 8 }}>Course</th>
            <th style={{ padding: 8 }}>Assessment</th>
            <th style={{ padding: 8 }}>Score</th>
            <th style={{ padding: 8 }}>Grade</th>
            <th style={{ padding: 8 }}>When</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr key={g.id} style={{ borderTop: '1px solid #e5e7eb' }}>
              <td style={{ padding: 8 }}>{g.course_code}</td>
              <td style={{ padding: 8 }}>{g.assignment || '—'}</td>
              <td style={{ padding: 8 }}>{g.score != null && g.max_score != null ? `${g.score}/${g.max_score} (${pct(g)})` : '—'}</td>
              <td style={{ padding: 8 }}>{g.grade || '—'}</td>
              <td style={{ padding: 8 }}>{g.created_at ? new Date(g.created_at).toLocaleString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
