import React, { useMemo } from "react";
import useDebounce from "../hooks/useDebounce";
import { useSearch } from "../context/SearchContext";

export default function EventsList({ events = [] }) {
  const { query, scope } = useSearch();
  const q = useDebounce(query.toLowerCase().trim(), 200);

  const filtered = useMemo(() => {
    if (!q) return events;
    if (scope !== "all" && scope !== "events") return events;

    return events.filter((ev) => {
      const text = [
        ev.title,
        ev.description,
        ev.location,
        ev.date,
        (ev.tags || []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [events, q, scope]);

  if (!filtered.length) return <p style={{ opacity: 0.7 }}>No events match “{query}”.</p>;

  return (
    <ul className="events-list">
      {filtered.map((ev, idx) => (
        <li key={ev.id || idx}>
          <h4>{ev.title}</h4>
          <p>{ev.description}</p>
          <small>
            {ev.location} • {ev.date}
          </small>
        </li>
      ))}
    </ul>
  );
}
