// src/components/NotesList.js
import useLiveCollection from "../hooks/useLiveCollection";
import { useAuth } from "../context/AuthContext";

export default function NotesList() {
  const { user } = useAuth();
  const notes = useLiveCollection("notes", "uploadedAt", "desc");
  const mine = notes.filter(n => n.ownerUid === user?.uid);
  return (
    <div style={{ padding: 16 }}>
      <h3>Your Notes</h3>
      {mine.length === 0 ? <p>No notes yet.</p> : (
        <ul>
          {mine.map(n => (
            <li key={n.id}>
              <a href={n.fileUrl} target="_blank" rel="noreferrer">{n.title}</a> ({n.courseCode})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}