// src/components/EventsList.js
import useLiveCollection from "../hooks/useLiveCollection";

export default function EventsList() {
  const events = useLiveCollection("events", "date", "asc");
  return (
    <div style={{ padding: 16 }}>
      <h2>Events</h2>
      {events.length === 0 ? <p>No events yet.</p> : (
        <ul>
          {events.map(ev => {
            const when = ev.date?.seconds ? new Date(ev.date.seconds * 1000).toLocaleString() : "—";
            return (
              <li key={ev.id}>
                <b>{ev.title}</b> — {when} @ {ev.location}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}