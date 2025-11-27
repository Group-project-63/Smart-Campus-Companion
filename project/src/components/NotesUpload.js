// src/components/NotesUpload.js (simple version)
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import NotesList from './NotesList';
import StorageNotesList from './StorageNotesList';

export default function NotesUpload() {
  const { currentUser, user } = useAuth();
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [debug, setDebug] = useState({});

  const handleUpload = async () => {
    setMsg('');
    if (!file) {
      setMsg('Please select a file');
      return;
    }
    setBusy(true);
    try {
      // gather runtime debug info for troubleshooting
      try {
        const sessionRes = await supabase.auth.getSession();
        console.log('supabase.getSession ->', sessionRes);
        setDebug((d) => ({ ...d, supabaseSession: sessionRes?.data?.session ?? null }));
      } catch (sessErr) {
        console.warn('getSession failed', sessErr);
        setDebug((d) => ({ ...d, supabaseSession: null, sessionError: String(sessErr) }));
      }
      // Prefer session user from context (keeps UI-auth in sync). Fallback to supabase.auth.getUser().
      let sessionUser = user ?? currentUser;
      if (!sessionUser || !sessionUser.id) {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) console.warn('Could not get session user from supabase.auth.getUser():', userErr);
        sessionUser = userData?.user ?? sessionUser;
      }

      console.log('NotesUpload sessionUser:', sessionUser);
      if (!sessionUser || !sessionUser.id) {
        setMsg('Please sign in before uploading notes.');
        setBusy(false);
        return;
      }

      // Bucket and path configuration
      const BUCKET = process.env.REACT_APP_NOTES_BUCKET || 'notes';
      // When true (default) uploads are stored under `${userId}/...`. Set to 'false' to store at bucket root.
      const useUserFolder = String(process.env.REACT_APP_NOTES_USE_USER_FOLDER).toLowerCase() === 'false' ? false : true;
      const useDb = String(process.env.REACT_APP_NOTES_USE_DB).toLowerCase() === 'true';
      setDebug((d) => ({ ...d, useDb, bucket: BUCKET, useUserFolder, sessionUserId: userId }));
      const userId = sessionUser.id;
      const filePath = useUserFolder ? `${userId}/${Date.now()}-${file.name}` : `${Date.now()}-${file.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      console.log('Upload result:', { data, uploadError });

      if (uploadError) {
        // surface full upload error in UI for debugging
        console.error('Storage uploadError:', uploadError);
        setMsg(`Upload failed (storage): ${uploadError.message || JSON.stringify(uploadError)}`);
        setBusy(false);
        return;
      }

      // Attempt to get a public URL. If the bucket is private, create a signed URL fallback.
      let fileUrl = null;
      try {
        const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        fileUrl = publicData?.publicUrl || null;
      } catch (e) {
        console.warn('getPublicUrl failed, will try signed url', e);
      }

      if (!fileUrl) {
        try {
          // create a signed URL valid for 1 hour
          const { data: signedData, error: signedErr } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(filePath, 60 * 60);
          if (!signedErr && signedData?.signedUrl) {
            fileUrl = signedData.signedUrl;
          }
        } catch (e) {
          console.warn('createSignedUrl failed', e);
        }
      }

      // Persist metadata in `notes` table only when REACT_APP_NOTES_USE_DB=true.
      // Default is storage-only to avoid row-level security errors in browser uploads.
      // If the project sets an explicit storage URL (S3 endpoint), include it when showing links.
      const STORAGE_BASE = process.env.REACT_APP_SUPABASE_STORAGE_URL || null;
      if (useDb) {
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

          if (insertErr) {
            // Log full error but don't throw so the storage upload remains successful
            console.error('Failed to insert note metadata:', insertErr, insertData);
            setMsg((prev) => `${prev ? prev + ' ' : ''}DB insert failed: ${insertErr.message || JSON.stringify(insertErr)}`);
            setDebug((d) => ({ ...d, lastDbError: insertErr }));
          } else {
            console.log('Inserted note metadata:', insertData);
          }
        } catch (ie) {
          console.error('Notes metadata insert exception:', ie);
          setMsg((prev) => `${prev ? prev + ' ' : ''}DB insert exception: ${ie?.message || String(ie)}`);
        }
      } else {
        console.log('Storage-only mode: skipping DB metadata insert (REACT_APP_NOTES_USE_DB not true)');
      }

      // Show the resolved file URL to the user (public or signed)
      // Prefer the canonical fileUrl returned by Supabase. If not available and a storage base is configured,
      // construct a plausible public URL for direct access. Note: using the project's storage base requires
      // correct bucket path and public access settings.
      let shownUrl = fileUrl;
      if (!shownUrl && STORAGE_BASE) {
        const BUCKET = process.env.REACT_APP_NOTES_BUCKET || 'notes';
        shownUrl = `${STORAGE_BASE.replace(/\/$/, '')}/${BUCKET}/${filePath}`;
      }
      setUploadedUrl(shownUrl || fileUrl);

      setMsg(`Uploaded: ${file.name}` + (fileUrl ? ` — ${fileUrl}` : ''));
      console.log('Supabase file URL:', fileUrl);
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('violates row-level')) {
        setMsg('Upload failed: row-level security prevented inserting the note. Ensure you are signed in and RLS policies allow you to insert notes (user_id must match your session).');
        setDebug((d) => ({ ...d, lastError: err }));
      } else {
        setMsg(`Upload failed: ${msg}`);
        setDebug((d) => ({ ...d, lastError: err }));
      }
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = async () => {
    if (!uploadedUrl) return;
    try {
      await navigator.clipboard.writeText(uploadedUrl);
      setMsg('Copied URL to clipboard');
    } catch (e) {
      console.warn('Copy failed', e);
      setMsg(uploadedUrl);
    }
  };

  return (
    <>
      <div>
        <h3>Upload Notes</h3>
        <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 8 }}>Notes</div>
        {msg && <p>{msg}</p>}
        {uploadedUrl && (
          <p>
            <a href={uploadedUrl} target="_blank" rel="noreferrer">Open file</a>
            {' '}
            <button onClick={copyUrl} style={{ marginLeft: 8 }}>Copy URL</button>
          </p>
        )}
        {/* Debug info: show session and config to help diagnose RLS/upload issues */}
        <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
          <div><strong>Debug:</strong></div>
          <div>Mode: {String(process.env.REACT_APP_NOTES_USE_DB).toLowerCase() === 'true' ? 'Storage + DB metadata' : 'Storage-only'}</div>
          <div>Bucket: {process.env.REACT_APP_NOTES_BUCKET || 'notes'}</div>
          <div>Use user folder: {String(process.env.REACT_APP_NOTES_USE_USER_FOLDER).toLowerCase() === 'false' ? 'false' : 'true'}</div>
          <div>Session user id: {debug.sessionUserId || (user?.id ?? currentUser?.id) || 'none'}</div>
          <div>Supabase session: {debug.supabaseSession ? 'present' : 'null'}</div>
          {debug.lastDbError && <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>{JSON.stringify(debug.lastDbError, null, 2)}</pre>}
          {debug.lastError && <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>{JSON.stringify(debug.lastError, null, 2)}</pre>}
        </div>
      </div>
      {String(process.env.REACT_APP_NOTES_USE_DB).toLowerCase() === 'false' ? (
        <StorageNotesList />
      ) : (
        <NotesList />
      )}
    </>
  );
}