import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const qparams = useQuery();
  const query = qparams.get('q') || '';
  const scope = qparams.get('scope') || 'all';
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ events: [], announcements: [], courses: [], notes: [], grades: [] });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || query.trim() === '') {
      setResults({ events: [], announcements: [], courses: [], notes: [], grades: [] });
      return;
    }

    const q = query.trim();

    const run = async () => {
      setLoading(true);
      try {
        const jobs = [];

        if (scope === 'all' || scope === 'events') {
          jobs.push(
            supabase
              .from('events')
              .select('*')
              .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
              .limit(30)
              .then(res => ({ type: 'events', data: res }))
          );
        }

        if (scope === 'all' || scope === 'announcements') {
          jobs.push(
            supabase
              .from('announcements')
              .select('*')
              .or(`title.ilike.%${q}%,body.ilike.%${q}%`)
              .limit(30)
              .then(res => ({ type: 'announcements', data: res }))
          );
        }

        if (scope === 'all' || scope === 'courses') {
          jobs.push(
            supabase
              .from('courses')
              .select('*')
              .or(`name.ilike.%${q}%,code.ilike.%${q}%,description.ilike.%${q}%,instructor.ilike.%${q}%`)
              .limit(30)
              .then(res => ({ type: 'courses', data: res }))
          );
        }

        if (scope === 'all' || scope === 'notes') {
          let notesQuery = supabase.from('notes').select('*').or(`name.ilike.%${q}%`);
          if (currentUser) notesQuery = notesQuery.eq('user_id', currentUser.id);
          jobs.push(notesQuery.limit(30).then(res => ({ type: 'notes', data: res })));
        }

        if (scope === 'all' || scope === 'grades') {
          if (currentUser) {
            jobs.push(
              supabase
                .from('grades')
                .select('*')
                .eq('student_id', currentUser.id)
                .or(`course_code.ilike.%${q}%,assignment.ilike.%${q}%`)
                .limit(30)
                .then(res => ({ type: 'grades', data: res }))
            );
          }
        }

        const settled = await Promise.all(jobs.map(p => p.catch(err => ({ error: err }))));

        const newResults = { events: [], announcements: [], courses: [], notes: [], grades: [] };
        for (const r of settled) {
          if (!r || r.error) continue;
          const type = r.type;
          const payload = r.data;
          if (!payload) continue;
          if (payload.error) continue;
          newResults[type] = payload.data || payload;
        }

        setResults(newResults);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [query, scope, currentUser]);

  const anyResults = Object.values(results).some(arr => arr && arr.length > 0);

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Search results for "{query}"</h2>
        <div>
          <button onClick={() => navigate(-1)} style={{ padding: '6px 10px' }}>Back</button>
        </div>
      </header>

      <p style={{ color: '#475569' }}>{scope === 'all' ? 'Searching across events, announcements, courses, notes and grades.' : `Searching in ${scope}`}</p>

      {loading && <div>Searching…</div>}

      {!loading && !anyResults && <div>No results found.</div>}

      {!loading && anyResults && (
        <div style={{ display: 'grid', gap: 18 }}>
          {results.announcements && results.announcements.length > 0 && (
            <section>
              <h3>Announcements</h3>
              <ul>
                {results.announcements.map(a => (
                  <li key={a.id}><a href="/announcements">{a.title}</a> — {a.body?.slice(0,140)}</li>
                ))}
              </ul>
            </section>
          )}

          {results.events && results.events.length > 0 && (
            <section>
              <h3>Events</h3>
              <ul>
                {results.events.map(ev => (
                  <li key={ev.id}><a href="/events">{ev.title}</a> — {ev.description?.slice(0,140)}</li>
                ))}
              </ul>
            </section>
          )}

          {results.courses && results.courses.length > 0 && (
            <section>
              <h3>Courses</h3>
              <ul>
                {results.courses.map(c => (
                  <li key={c.id}><a href="/courses">{c.code ? `${c.code} — ` : ''}{c.name}</a> — {c.description?.slice(0,140)}</li>
                ))}
              </ul>
            </section>
          )}

          {results.notes && results.notes.length > 0 && (
            <section>
              <h3>My Notes</h3>
              <ul>
                {results.notes.map(n => (
                  <li key={n.id}><a href="/notes">{n.name}</a></li>
                ))}
              </ul>
            </section>
          )}

          {results.grades && results.grades.length > 0 && (
            <section>
              <h3>Grades</h3>
              <ul>
                {results.grades.map(g => (
                  <li key={g.id}><a href="/grades">{g.course_code} — {g.assignment || 'Assessment'}</a></li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
