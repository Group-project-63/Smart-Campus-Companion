import React, { useMemo } from "react";
import useDebounce from "../hooks/useDebounce";
import { useSearch } from "../context/SearchContext";

export default function NotesList({ notes = [] }) {
  const { query, scope } = useSearch();
  const q = useDebounce(query.toLowerCase().trim(), 200);

  const filtered = useMemo(() => {
    if (!q) return notes;
    if (scope !== "all" && scope !== "notes") return notes;

    return notes.filter((n) => {
      const text = [n.title, n.subject, n.author, n.text, (n.tags || []).join(" ")]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [notes, q, scope]);

  return (
    <div>
      {filtered.length ? (
        filtered.map((n) => (
          <div key={n.id}>
            <h4>{n.title}</h4>
            <p>
              <strong>{n.subject}</strong> • {n.author}
            </p>
            <p>{n.text}</p>
          </div>
        ))
      ) : (
        <p style={{ opacity: 0.7 }}>No notes match “{query}”.</p>
      )}
    </div>
  );
}
