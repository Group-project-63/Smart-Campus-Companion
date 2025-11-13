import React, { useMemo } from "react";
import useLiveCollection from "../hooks/useLiveCollection";
import { useSearch } from "../context/SearchContext";
import useDebounce from "../hooks/useDebounce";

export default function Announcements() {
  const items = useLiveCollection("announcements", "publishedAt", "desc");

  //read global search
  const { query, scope } = useSearch();
  const q = useDebounce(query.toLowerCase().trim(), 200);

  const filtered = useMemo(() => {
    // If no query, show all
    if (!q) return items;
    // Respect scope: if user is not searching announcements, don't filter here
    if (scope !== "all" && scope !== "announcements") return items;

    return items.filter((a) => {
      const ts = a.publishedAt?.seconds
        ? new Date(a.publishedAt.seconds * 1000)
        : null;
      const when = ts ? ts.toLocaleString() : "";

      const text = [
        a.title,
        a.body,
        a.audience?.dept,
        a.audience?.year ? String(a.audience.year) : "",
        when,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [items, q, scope]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Announcements</h2>

      {/* Empty states */}
      {items.length === 0 ? (
        <p>No announcements yet.</p>
      ) : filtered.length === 0 && q ? (
        <p style={{ opacity: 0.7 }}>
          No announcements match “{query}”.
        </p>
      ) : (
        <ul>
          {filtered.map((a) => {
            const ts = a.publishedAt?.seconds
              ? new Date(a.publishedAt.seconds * 1000)
              : null;

            return (
              <li key={a.id} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div>{a.body}</div>
                <small style={{ color: "#6b7280" }}>
                  {(a.audience?.dept || "All Depts")} ·{" "}
                  {a.audience?.year ? `Year ${a.audience.year}` : "All Years"} ·{" "}
                  {ts ? ts.toLocaleString() : "—"}
                </small>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}