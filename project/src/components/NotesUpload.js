// src/components/NotesUpload.js (simple version)
import React, { useState } from 'react';
// import { useSearch } from '../context/SearchContext';

export default function NotesUpload() {
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setMsg(data.error || `Upload failed (HTTP ${resp.status})`);
      } else {
        setMsg(`Uploaded: ${data.file?.name || file.name}`);
        // Optionally show the URL: http://localhost:4000 + data.file.url
        console.log('File URL:', `http://localhost:4000${data.file?.url}`);
      }
    } catch (err) {
      console.error(err);
      setMsg(`Upload failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
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
  );
}