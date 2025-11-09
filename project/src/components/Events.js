// src/components/Events.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: ''
  });

  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, 'events'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await addDoc(collection(db, 'events'), formData);
    setFormData({ title: '', date: '', description: '' });
    fetchEvents();
  };

  return (
    <div>
      <h2>Events</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        <button type="submit">Add Event</button>
      </form>

      <ul>
        {events.map(event => (
          <li key={event.id}>
            <strong>{event.title}</strong> ({event.date})<br />
            {event.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Events;