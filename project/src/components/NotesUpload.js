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
      // Ensure the user is signed in. Use live session from Supabase to avoid stale state.
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      const sessionUser = userData?.user ?? currentUser;
      if (userErr) console.warn('Could not get session user:', userErr);
      console.log('NotesUpload sessionUser:', sessionUser);
      if (!sessionUser || !sessionUser.id) {
        setMsg('Please sign in before uploading notes.');
        setBusy(false);
        return;
      }

      // Ensure a bucket named `notes` exists in your Supabase project.
      const userId = sessionUser.id;
      const filePath = `${userId}/${Date.now()}-${file.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      console.log('Upload result:', { data, uploadError });

      if (uploadError) throw uploadError;

      // Attempt to get a public URL. If the bucket is private, create a signed URL fallback.
      let fileUrl = null;
      try {
        const { data: publicData } = supabase.storage.from('notes').getPublicUrl(filePath);
        fileUrl = publicData?.publicUrl || null;
      } catch (e) {
        console.warn('getPublicUrl failed, will try signed url', e);
      }

      if (!fileUrl) {
        try {
          // create a signed URL valid for 1 hour
          const { data: signedData, error: signedErr } = await supabase.storage
            .from('notes')
            .createSignedUrl(filePath, 60 * 60);
          if (!signedErr && signedData?.signedUrl) {
            fileUrl = signedData.signedUrl;
          }
        } catch (e) {
          console.warn('createSignedUrl failed', e);
        }
      }

      // Persist metadata in `notes` table (save path and best-effort URL)
      try {
        const { data: insertData, error: insertErr } = await supabase.from('notes').insert({
          user_id: userId,
          name: file.name,
          path: filePath,
          url: fileUrl,
          content_type: file.type,
          size: file.size,
          created_at: new Date().toISOString(),
        });
        if (insertErr) console.error('Failed to insert note metadata:', insertErr, insertData);
        else console.log('Inserted note metadata:', insertData);
      } catch (ie) {
        console.error('Notes metadata insert exception:', ie);
      }

      setMsg(`Uploaded: ${file.name}` + (fileUrl ? ` — ${fileUrl}` : ''));
      console.log('Supabase file URL:', fileUrl);
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('violates row-level')) {
        setMsg('Upload failed: row-level security prevented inserting the note. Ensure you are signed in and RLS policies allow you to insert notes (user_id must match your session).');
      } else {
        setMsg(`Upload failed: ${msg}`);
      }
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