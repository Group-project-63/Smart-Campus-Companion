// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import MiniCalendar from "../components/MiniCalendar";
import { supabase } from "../services/supabase";

// Add CSS for animations and decorative blobs
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  /* entrance animation */
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(12px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .fade-in-up { opacity: 0; transform: translateY(12px); animation: fadeUp 600ms cubic-bezier(.2,.9,.2,1) forwards; }
  .delay-1 { animation-delay: 100ms; }
  .delay-2 { animation-delay: 220ms; }
  .delay-3 { animation-delay: 340ms; }
  .delay-4 { animation-delay: 460ms; }

  /* subtle floating decoration */
  .blob {
    position: absolute;
    pointer-events: none;
    filter: blur(28px) saturate(120%);
    opacity: 0.55;
    mix-blend-mode: screen;
    border-radius: 50%;
    transform-origin: center;
  }

  .blob-1 { width: 360px; height: 260px; right: -60px; top: -30px; background: radial-gradient(circle at 20% 30%, rgba(118,75,162,0.95), rgba(102,126,234,0.85)); animation: float 8s ease-in-out infinite; }
  .blob-2 { width: 320px; height: 220px; left: -80px; bottom: -40px; background: radial-gradient(circle at 80% 60%, rgba(79,172,254,0.9), rgba(240,147,251,0.85)); animation: float 10s ease-in-out infinite reverse; }

  @keyframes float {
    0% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-14px) rotate(4deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }

  /* home card hover (slight lift) */
  .home-card {
    transition: transform 260ms cubic-bezier(.2,.9,.2,1), box-shadow 260ms ease, backdrop-filter 260ms ease;
  }
  .home-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 30px 60px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.6) !important; }

  /* small accessibility: make reduced-motion users skip animations */
  @media (prefers-reduced-motion: reduce) {
    .fade-in-up, .blob, .home-card { animation: none !important; transition: none !important; }
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('style[data-home-styles]')) {
  styleSheet.setAttribute('data-home-styles', 'true');
  document.head.appendChild(styleSheet);
}

const Home = () => {
  const { user, loading, isAdmin } = useAuth();
  const { setScope } = useSearch();
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    setScope("all");
  }, [setScope]);

  // Load announcements
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setAnnouncements(data || []);
      } catch (err) {
        console.error("Failed to load announcements:", err);
        setAnnouncements([]);
      } finally {
        setAnnouncementsLoading(false);
      }
    })();
  }, []);

  // Load upcoming events and show them on home page
  useEffect(() => {
    (async () => {
      setEventsLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);
        
        if (error) {
          console.error("Supabase events error:", error);
          throw error;
        }
        console.log("Fetched events:", data);
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load events:", err);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  const prettyName =
    user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "") || "User";

  return (
    <div style={styles.page} className="home-root">
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      {/* Hero */}
      <section style={styles.hero} className="fade-in-up delay-1">
        <div style={styles.heroContent}>
          <div style={styles.greeting}>
            {loading ? (
              <span style={{ fontSize: "32px", fontWeight: 700, color: "#1c1a43ff" }}>
                Welcome to Smart Campus Companion
              </span>
            ) : (
              <>
                <span style={styles.greetingHand}>👋</span>
                <span style={styles.greetingText}>Hello, {prettyName}
                !</span>
              </>
            )}
          </div>
          <h2 style={styles.title}> Smart Campus Companion</h2>
          <p style={styles.subtitle}>
            Manage your classes, events, and campus info—all in one place.
          </p>
        </div>
        <div style={styles.heroBadge}>🚀 MVP</div>
      </section>

      {/* Quick Actions */}
      <section style={styles.section} className="home-section fade-in-up delay-2">
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.grid}>
          <Card to="/timetable" emoji="📘" title="Timetable" desc="View & manage your weekly schedule." />
          <Card to="/courses" emoji="📚" title="Courses" desc="Browse and enroll in courses." />
          <Card to="/map" emoji="🗺️" title="Campus Map" desc="Find buildings and facilities." />
          {/* Notes Upload removed from homepage per request */}
          {isAdmin && <Card to="/admindashboard" emoji="🛠️" title="Admin Dashboard" desc="Manage campus events and announcements." />}
        </div>
      </section>

      {/* Announcements Section */}
      <section style={{ marginTop: "32px" }} className="fade-in-up delay-3">
        <h2 style={styles.sectionTitle}>📢 Latest Announcements</h2>
        <div style={{ display: "grid", gap: "16px" }}>
          {announcementsLoading ? (
            <div style={styles.announcementCard} className="home-announcement-card">
              <div style={{ color: "#64748b", fontStyle: "italic" }}>Loading announcements...</div>
            </div>
          ) : announcements.length === 0 ? (
            <div style={styles.announcementCard} className="home-announcement-card">
              <div style={{ color: "#64748b", fontStyle: "italic" }}>No announcements yet.</div>
            </div>
          ) : (
            <div style={styles.announcementCard} className="home-announcement-card">
              {announcements.map((announcement, idx) => (
                <div key={announcement.id} style={{ ...styles.eventItem, borderBottom: idx !== announcements.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                  <div style={styles.announcementTitle}>{announcement.title}</div>
                  <div style={styles.announcementBodySmall}>{announcement.body}</div>
                  <div style={styles.announcementMeta}>
                    {announcement.audience?.dept && <span style={styles.announcementTag}>{announcement.audience.dept}</span>}
                    {announcement.audience?.year && <span style={styles.announcementTag}>Year {announcement.audience.year}</span>}
                    <span style={styles.announcementTime}>
                      {new Date(announcement.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events (now visible on home) */}
      <section style={{ marginTop: "32px" }} className="fade-in-up delay-3">
        <h2 style={styles.sectionTitle}>📅 Upcoming Events</h2>
        <div style={{ display: "grid", gap: "16px" }}>
          {eventsLoading ? (
            <div style={styles.announcementCard}>
              <div style={{ color: "#64748b", fontStyle: "italic" }}>Loading events...</div>
            </div>
          ) : events.length === 0 ? (
            <div style={styles.announcementCard}>
              <div style={{ color: "#64748b", fontStyle: "italic" }}>No upcoming events.</div>
            </div>
          ) : (
            <div style={styles.announcementCard}>
              {events.map((ev, idx) => (
                <div key={ev.id} style={{ ...styles.eventItem, borderBottom: idx !== events.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                  <div style={styles.announcementTitle}>{ev.title || "Untitled Event"}</div>
                  <div style={styles.announcementBodySmall}>{ev.description || "No description provided."}</div>
                  <div style={styles.announcementMeta}>
                    {ev.date && <span style={styles.announcementTag}>📅 {ev.date}</span>}
                    <span style={styles.announcementTime}>
                      {ev.created_at ? new Date(ev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No date set"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ marginTop: "32px" }} className="fade-in-up delay-4">
        <h2 style={styles.sectionTitle}>Calendar</h2>
        <MiniCalendar />
      </section>
    </div>
  );
};

function Card({ to, emoji, title, desc }) {
  return (
    <Link to={to} style={styles.card} className="home-card">
      <div style={styles.cardEmoji}>{emoji}</div>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardDesc}>{desc}</div>
    </Link>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "transparent",
    padding: "24px",
    position: "relative",
    overflow: "hidden"
  },
  hero: {
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between",
    border: "1px solid rgba(255, 255, 255, 0.2)", 
    background: "rgba(255, 255, 255, 0.95)", 
    padding: "40px",
    borderRadius: "20px", 
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
    marginBottom: "24px",
    position: "relative", 
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  heroContent: { maxWidth: "720px" },
  greeting: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  greetingHand: {
    fontSize: "48px",
    display: "inline-block",
    animation: "wave 0.6s ease-in-out",
    transformOrigin: "70% 70%",
  },
  greetingText: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#0f172a",
    backgroundImage: "linear-gradient(135deg, #070707ff, #000000ff)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  title: { 
    fontSize: "36px", 
    margin: 0, 
    color: "#0f172a", 
    fontWeight: 800,
    backgroundImage: "linear-gradient(135deg, #000000ff, #000000ff)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: { fontSize: "18px", color: "#475569", marginTop: "12px", fontWeight: 500 },
  userInfo: { marginTop: "12px", fontSize: "15px", color: "#64748b", fontWeight: 500 },
  heroBadge: {
    position: "absolute", 
    right: "24px", 
    top: "24px",
    background: "linear-gradient(135deg, #000000ff, #000000ff)", 
    color: "#fff", 
    padding: "8px 14px",
    borderRadius: "50px", 
    fontSize: "13px", 
    fontWeight: 700, 
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
  },
  section: { marginTop: "32px" },
  sectionTitle: {
    fontSize: "24px",
    color: "#0f172a",
    marginBottom: "18px",
    fontWeight: 700,
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.06)"
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" },
  card: {
    display: "block", 
    border: "1px solid rgba(255, 255, 255, 0.2)", 
    background: "rgba(255, 255, 255, 0.95)", 
    borderRadius: "16px", 
    padding: "24px", 
    textDecoration: "none", 
    color: "inherit",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, backdrop-filter 0.3s ease",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
  },
  cardEmoji: { fontSize: "32px", marginBottom: "12px" },
  cardTitle: { fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" },
  cardDesc: { fontSize: "14px", color: "#64748b", lineHeight: "1.5" },
  logoutBtn: {
    padding: "10px 16px", backgroundColor: "#ef4444", color: "#fff",
    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600,
  },
  announcementCard: {
    display: "block",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "16px",
    padding: "20px",
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
  },
  announcementTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "10px",
  },
  announcementBody: {
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  announcementMeta: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  eventItem: {
    padding: '12px 0',
  },
  announcementBodySmall: {
    fontSize: '13px',
    color: '#475569',
    marginBottom: '8px',
  },
  announcementTag: {
    display: "inline-block",
    padding: "4px 10px",
    background: "rgba(102, 126, 234, 0.1)",
    color: "#667eea",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    border: "1px solid rgba(102, 126, 234, 0.2)",
  },
  announcementTime: {
    fontSize: "12px",
    color: "#94a3b8",
    marginLeft: "auto",
  },
};

export default Home;