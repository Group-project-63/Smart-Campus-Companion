// src/components/NotesUpload.js (simple version)
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import NotesList from './NotesList';

export default function NotesUpload() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const handleUpload = async () => {
    setMsg('');
    if (!file) {
      setMsg('Please select a file');
      return;
    }
    setBusy(true);
    try {
      // Ensure a bucket named `notes` exists in your Supabase project.
      const userId = currentUser?.id || 'anonymous';
      const filePath = `${userId}/${Date.now()}-${file.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Get a public URL (requires `notes` bucket to be public) or use createSignedUrl
      const { data: publicData } = supabase.storage.from('notes').getPublicUrl(filePath);
      const publicUrl = publicData?.publicUrl || null;

      // Persist metadata in `notes` table
      try {
        const { error: insertErr } = await supabase.from('notes').insert({
          user_id: userId,
          name: file.name,
          path: filePath,
          url: publicUrl,
          content_type: file.type,
          size: file.size,
          created_at: new Date().toISOString(),
        });
        if (insertErr) console.error('Failed to insert note metadata:', insertErr);
      } catch (ie) {
        console.error('Notes metadata insert exception:', ie);
      }

      setMsg(`Uploaded: ${file.name}` + (publicUrl ? ` — ${publicUrl}` : ''));
      console.log('Supabase file URL:', publicUrl);
    } catch (err) {
      console.error(err);
      setMsg(`Upload failed: ${err?.message || err}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div>
        <h3>Upload Notes</h3>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button onClick={handleUpload} disabled={!file || busy}>
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        {msg && <p>{msg}</p>}
      </div>
      <NotesList />
    </>
  );
}