import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useSearch } from '../context/SearchContext';
import useDebounce from '../hooks/useDebounce';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', date: '', description: '' });

  // 🔎 Global search state
  const { query, scope } = useSearch();
  const q = useDebounce(query.toLowerCase().trim(), 200);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('fetchEvents failed:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('events').insert({ ...formData, created_at: new Date().toISOString() });
      if (error) throw error;
    } catch (err) {
      console.error('add event failed:', err);
    }
    setFormData({ title: '', date: '', description: '' });
    fetchEvents();
  };

  const startEdit = event => {
    setEditingId(event.id);
    setEditData({ title: event.title, date: event.date, description: event.description });
  };

  const handleEditChange = e => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    try {
      const { error } = await supabase.from('events').update(editData).eq('id', editingId);
      if (error) throw error;
    } catch (err) {
      console.error('saveEdit failed:', err);
    }
    setEditingId(null);
    setEditData({ title: '', date: '', description: '' });
    fetchEvents();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ title: '', date: '', description: '' });
  };

  const removeEvent = async id => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('removeEvent failed:', err);
    }
    fetchEvents();
  };

  // 🧠 Client-side filtering based on global query/scope
  const filtered = useMemo(() => {
    if (!q) return events;
    // Respect search scope; only filter here if scope is 'all' or 'events'
    if (scope !== 'all' && scope !== 'events') return events;

    return events.filter(ev => {
      const text = [
        ev.title,
        ev.date,           // 'YYYY-MM-DD' string from your input
        ev.description
      ].join(' ').toLowerCase();

      return text.includes(q);
    });
  }, [events, q, scope]);

  return (
    <div className="events-container">
      <h2 className="heading">Campus Events</h2>

      {/* Add Event Form */}
      <form onSubmit={handleSubmit} className="event-form">
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <button type="submit" className="primary-btn">Add Event</button>
      </form>

      {/* Event List */}
      <div className="event-list">
        {events.length === 0 ? (
          <p>No events yet.</p>
        ) : filtered.length === 0 && q ? (
          <p style={{ opacity: 0.7 }}>No events match “{query}”.</p>
        ) : (
          filtered.map(event => (
            <div key={event.id} className="event-card">
              {editingId === event.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    name="title"
                    value={editData.title}
                    onChange={handleEditChange}
                  />
                  <input
                    type="date"
                    name="date"
                    value={editData.date}
                    onChange={handleEditChange}
                  />
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                  />
                  <div className="actions">
                    <button className="primary-btn" onClick={saveEdit}>Save</button>
                    <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{event.title}</h3>
                  <p className="event-date">{event.date}</p>
                  <p>{event.description}</p>
                  <div className="actions">
                    <button className="edit-btn" onClick={() => startEdit(event)}>Edit</button>
                    <button className="delete-btn" onClick={() => removeEvent(event.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;