import React from 'react';
import useRealtimeTable from '../hooks/useRealtimeTable';
import { useAuth } from '../context/AuthContext';

export default function NotesList() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const [notes, loaded] = useRealtimeTable('notes', { match: { column: 'user_id', value: userId }, order: { column: 'created_at', ascending: false } });

  if (!userId) return <p>Please sign in to view your notes.</p>;
  if (!loaded) return <p>Loading notes…</p>;

  if (!notes || notes.length === 0) return <p>No notes uploaded yet.</p>;

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Your Notes</h3>
      <ul>
        {notes.map((n) => (
          <li key={n.id} style={{ marginBottom: 8 }}>
            <a href={n.url} target="_blank" rel="noreferrer">{n.name}</a>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(n.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

