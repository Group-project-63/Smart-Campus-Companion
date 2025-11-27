import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function StorageNotesList() {
  const { currentUser, user } = useAuth();
  const userId = (user ?? currentUser)?.id;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchFiles = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const BUCKET = process.env.REACT_APP_NOTES_BUCKET || 'notes';
        const useUserFolder = String(process.env.REACT_APP_NOTES_USE_USER_FOLDER).toLowerCase() === 'false' ? false : true;
        const prefix = useUserFolder ? `${userId}` : '';

        // list objects under prefix (folder)
        const { data: listData, error: listErr } = await supabase.storage.from(BUCKET).list(prefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
        if (listErr) throw listErr;

        // For each file construct path and get a usable URL (public or signed)
        const map = await Promise.all((listData || []).map(async (item) => {
          const path = prefix ? `${prefix}/${item.name}` : item.name;
          // Try public url first
          let url = null;
          try {
            const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
            url = pub?.publicUrl || null;
          } catch (e) {
            // ignore
          }

          if (!url) {
            try {
              const { data: signed, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
              if (!signErr && signed?.signedUrl) url = signed.signedUrl;
            } catch (e) {
              // ignore
            }
          }

          return {
            name: item.name,
            path,
            updated_at: item.updated_at || null,
            url,
          };
        }));

        if (mounted) setFiles(map || []);
      } catch (err) {
        console.error('StorageNotesList error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFiles();
    return () => { mounted = false; };
  }, [userId]);

  if (!userId) return <p>Please sign in to view your notes.</p>;
  if (loading) return <p>Loading notes…</p>;
  if (!files || files.length === 0) return <p>No notes uploaded yet.</p>;

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Your Notes (storage)</h3>
      <ul>
        {files.map((f) => (
          <li key={f.path} style={{ marginBottom: 8 }}>
            <a href={f.url || '#'} target="_blank" rel="noreferrer">{f.name}</a>
            <div style={{ fontSize: 12, color: '#666' }}>{f.updated_at ? new Date(f.updated_at).toLocaleString() : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
