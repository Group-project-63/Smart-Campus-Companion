import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';
import './MiniCalendar.css';

function getMonthDays(year, month) {
  // month: 0-11
  const first = new Date(year, month, 1);
  const startDow = first.getDay(); // 0-6 (Sun-Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  // add leading blanks
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
}

function toYMD(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function MiniCalendar() {
  const { user } = useAuth();
  const { setQuery, setScope } = useSearch();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [focused, setFocused] = useState(new Date());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.from('events').select('id,title,date');
        if (mounted) setEvents(data || []);
      } catch (err) {
        console.error('MiniCalendar: failed to load events', err);
      }
    })();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.from('timetables').select('items').eq('id', user.id).limit(1).single();
        if (mounted) setSlots((data?.items) || []);
      } catch (err) {
        console.error('MiniCalendar: failed to load timetables', err);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  const eventsByDate = useMemo(() => {
    const map = {};
    (events || []).forEach(ev => {
      if (!ev?.date) return;
      map[ev.date] = map[ev.date] || [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const slotsByDate = useMemo(() => {
    const map = {};
    (slots || []).forEach(s => {
      if (!s?.date) return;
      map[s.date] = map[s.date] || [];
      map[s.date].push(s);
    });
    return map;
  }, [slots]);

  const year = focused.getFullYear();
  const month = focused.getMonth();
  const days = getMonthDays(year, month);
  const today = new Date();
  const todayYMD = toYMD(today);

  const prevMonth = () => setFocused(new Date(year, month - 1, 1));
  const nextMonth = () => setFocused(new Date(year, month + 1, 1));

  const onDayClick = (date) => {
    if (!date) return;
    const ymd = toYMD(date);
    setScope('events');
    setQuery(ymd);
    navigate('/events');
  };

  const openTimetableFor = (date) => {
    if (!date) return;
    const ymd = toYMD(date);
    navigate(`/timetable?date=${ymd}`);
  };

  return (
    <div className="mini-cal">
      <div className="mc-header">
        <button className="mc-nav" onClick={prevMonth}>&lt;</button>
        <div className="mc-title">{focused.toLocaleString(undefined, { month: 'long' })} {year}</div>
        <button className="mc-nav" onClick={nextMonth}>&gt;</button>
      </div>

      <div className="mc-grid">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="mc-weekday">{d}</div>
        ))}

        {days.map((dt, idx) => {
          if (!dt) return <div key={`b${idx}`} className="mc-day blank" />;
          const ymd = toYMD(dt);
          const evs = eventsByDate[ymd] || [];
          const sls = slotsByDate[ymd] || [];
          const isToday = ymd === todayYMD;
          const classes = ['mc-day'];
          if (isToday) classes.push('today');
          if (evs.length && sls.length) classes.push('both');
          else if (evs.length) classes.push('has-event');
          else if (sls.length) classes.push('has-slot');

          return (
            <div key={ymd} className={classes.join(' ')} onClick={() => onDayClick(dt)}>
              <div className="mc-day-num">{dt.getDate()}</div>
              <div className="mc-markers">
                {evs.length > 0 && <span className="mc-dot event" title={`${evs.length} event(s)`}></span>}
                {sls.length > 0 && <span className="mc-dot slot" title={`${sls.length} timetable slot(s)`}></span>}
              </div>
              {(sls.length > 0) && (
                <button className="mc-timetable-link" onClick={(e) => { e.stopPropagation(); openTimetableFor(dt); }}>Timetable</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
