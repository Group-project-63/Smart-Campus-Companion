import React, { useEffect, useState } from 'react';
import useRealtimeTable from '../hooks/useRealtimeTable';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function NotesList() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const [notes, loaded] = useRealtimeTable('notes', { match: { column: 'user_id', value: userId }, order: { column: 'created_at', ascending: false } });
  const [signedUrls, setSignedUrls] = useState({});

  useEffect(() => {
    let mounted = true;
    const fetchSignedUrls = async () => {
      if (!notes || notes.length === 0) return;
      const map = {};
      for (const n of notes) {
        if (n.url) {
          map[n.id] = n.url;
          continue;
        }
        if (n.path) {
          try {
            // Create a short-lived signed URL for private buckets (60 minutes)
            const { data, error } = await supabase.storage.from('notes').createSignedUrl(n.path, 60 * 60);
            if (!error && data?.signedUrl) map[n.id] = data.signedUrl;
            else map[n.id] = null;
          } catch (e) {
            console.error('Failed to create signed url for', n.path, e);
            map[n.id] = null;
          }
        } else {
          map[n.id] = null;
        }
      }
      if (mounted) setSignedUrls(map);
    };

    fetchSignedUrls();
    return () => { mounted = false; };
  }, [notes]);

  if (!userId) return <p>Please sign in to view your notes.</p>;
  if (!loaded) return <p>Loading notes…</p>;

  if (!notes || notes.length === 0) return <p>No notes uploaded yet.</p>;

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Your Notes</h3>
      <ul>
        {notes.map((n) => (
          <li key={n.id} style={{ marginBottom: 8 }}>
            <a href={signedUrls[n.id] || n.url || '#'} target="_blank" rel="noreferrer">{n.name}</a>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(n.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

