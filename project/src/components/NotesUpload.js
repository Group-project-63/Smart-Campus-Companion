// src/components/NotesUpload.js
import React, { useState, useEffect } from 'react';
import { storage } from '../services/firebase';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';

const NotesUpload = () => {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState([]);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const storageRef = ref(storage, `notes/${file.name}`);
    await uploadBytes(storageRef, file);
    setFile(null);
    fetchNotes();
  };

  const fetchNotes = async () => {
    const notesRef = ref(storage, 'notes/');
    const result = await listAll(notesRef);
    const urls = await Promise.all(result.items.map(item => getDownloadURL(item)));
    setNotes(urls);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div>
      <h2>Upload Notes</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      <h3>Uploaded Notes</h3>
      <ul>
        {notes.map((url, index) => (
          <li key={index}>
            <a href={url} target="_blank" rel="noopener noreferrer">View Note {index + 1}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotesUpload;