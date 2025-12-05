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
  const [timetableItems, setTimetableItems] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    setScope("all");
  }, [setScope]);

  // Load timetable slots
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("timetables")
          .select("items")
          .eq("id", user.id)
          .limit(1)
          .single();
        if (error && error.code !== "PGRST116") throw error;
        setTimetableItems(data?.items || []);
      } catch (err) {
        console.error("Failed to load timetable:", err);
        setTimetableItems([]);
      } finally {
        setTimetableLoading(false);
      }
    })();
  }, [user]);

  // Load announcements and subscribe to changes
  useEffect(() => {
    const loadAnnouncements = async () => {
      setAnnouncementsLoading(true);
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(3);
        if (error) throw error;
        console.log("Announcements loaded:", data);
        setAnnouncements(data || []);
      } catch (err) {
        console.error("Failed to load announcements:", err);
        setAnnouncements([]);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    loadAnnouncements();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("announcements-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        (payload) => {
          console.log("Announcement change detected:", payload);
          // Reload announcements when any change occurs
          loadAnnouncements();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load events and subscribe to changes
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true })
          .limit(3);
        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load events:", err);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          // Reload events when any change occurs
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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


      {/* Announcements and events removed from homepage */}

      {/* Timetable Section */}
      <section style={{ marginTop: "32px" }} className="fade-in-up delay-3">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={styles.sectionTitle}>📘 My Timetable</h2>
          <Link to="/timetable" style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none' }}>Edit</Link>
        </div>
        <div style={{ marginTop: 12 }}>
          {timetableLoading ? (
            <div style={styles.timetableCard}>
              <div style={{ color: "#64748b", fontStyle: "italic" }}>Loading timetable...</div>
            </div>
          ) : timetableItems.length === 0 ? (
            <div style={styles.timetableCard}>
              <div style={{ color: "#64748b", fontStyle: "italic" }}>No timetable slots yet. <Link to="/timetable" style={{ color: '#3b82f6' }}>Add one</Link></div>
            </div>
          ) : (
            <div style={styles.timetableCard}>
              {timetableItems.map((item, idx) => (
                <div key={idx} style={{ borderBottom: idx !== timetableItems.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', padding: '12px 0' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    📅 {item.date} · ⏰ {item.start} - {item.end} · 🏢 {item.room}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Announcements Section */}
      <section style={{ marginTop: "32px" }} className="fade-in-up delay-2">
        <h2 style={styles.sectionTitle}>📢 Latest Announcements</h2>
        <div style={{ marginTop: 12 }}>
          {announcementsLoading ? (
            <div style={styles.previewCard}>
              <div style={{ color: "#64748b", fontStyle: "italic" }}>Loading announcements...</div>
            </div>
          ) : announcements.length === 0 ? (
            <div style={styles.previewCard}>
              <div style={{ color: "#64748b", fontStyle: "italic" }}>No announcements yet.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {announcements.map((announcement) => (
                <div key={announcement.id} style={styles.previewCard}>
                  <div style={styles.announcementTitle}>{announcement.title}</div>
                  <div style={styles.announcementBody}>
                    {announcement.body ? announcement.body.substring(0, 100) : "No description"}...
                  </div>
                  <div style={styles.announcementMeta}>
                    <span style={styles.announcementTag}>{announcement.audience?.dept || 'All'}</span>
                    <span style={styles.announcementTime}>
                      {announcement.published_at 
                        ? new Date(announcement.published_at).toLocaleDateString() 
                        : new Date(announcement.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section style={{ marginTop: "32px" }} className="fade-in-up delay-2">
        <h2 style={styles.sectionTitle}>📅 Upcoming Events</h2>
        <div style={{ marginTop: 12 }}>
          {eventsLoading ? (
            <div style={styles.previewCard}>
              <div style={{ color: "#64748b", fontStyle: "italic" }}>Loading events...</div>
            </div>
          ) : events.length === 0 ? (
            <div style={styles.previewCard}>
              <div style={{ color: "#64748b", fontStyle: "italic" }}>No events upcoming.</div>
            </div>
          ) : (
            <div>
              {events.map((event) => (
                <div key={event.id} style={styles.previewCard}>
                  <div style={styles.announcementTitle}>{event.name}</div>
                  <div style={styles.announcementBody}>{event.description?.substring(0, 100) || 'No description'}...</div>
                  <div style={styles.announcementMeta}>
                    <span style={styles.announcementTag}>{event.category || 'Event'}</span>
                    <span style={styles.announcementTime}>
                      {new Date(event.date).toLocaleDateString()}
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
  previewCard: {
    display: "block",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "18px",
    color: "inherit",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  },
  timetableCard: {
    display: "block",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "18px",
    color: "inherit",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  },
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