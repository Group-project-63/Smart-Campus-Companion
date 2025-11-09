
// src/components/Announcements.js
import useLiveCollection from "../hooks/useLiveCollection";
export default function Announcements() {
  const items = useLiveCollection("announcements", "publishedAt", "desc");
  return (
    <div style={{ padding: 16 }}>
      <h2>Announcements</h2>
      {items.length === 0 ? <p>No announcements yet.</p> : (
        <ul>
          {items.map(a => {
            const ts = a.publishedAt?.seconds ? new Date(a.publishedAt.seconds * 1000) : null;
            return (
              <li key={a.id} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div>{a.body}</div>
                <small style={{ color: "#6b7280" }}>
                  {(a.audience?.dept || "All Depts")} · {a.audience?.year ? `Year ${a.audience.year}` : "All Years"} · {ts ? ts.toLocaleString() : "—"}
                </small>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}