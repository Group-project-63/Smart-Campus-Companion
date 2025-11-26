import React from 'react';
import GradesList from '../components/GradesList';
import { useAuth } from '../context/AuthContext';

export default function Grades() {
  const { currentUser } = useAuth();

  return (
    <div style={{ padding: 16, minHeight: '100vh', fontFamily: 'system-ui, Arial' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My Grades</h2>
      </header>

      <p style={{ color: '#475569', marginTop: 8 }}>Below are your recorded assessments and scores.</p>

      {!currentUser && (
        <div style={{ marginTop: 24, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>Please sign in to view your grades.</div>
      )}

      {currentUser && (
        <div style={{ marginTop: 12 }}>
          <GradesList />
        </div>
      )}
    </div>
  );
}
