import React, { useState } from 'react';
import { createSlot } from '../services/slotService';

export default function CreateSlot({ onLogout, onShowLogin, isAuthenticated }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!user || !isAuthenticated) { 
      setMsg('Please login first');
      if (onShowLogin) onShowLogin();
      return; 
    }
    setMsg('Creating slot...');
    try {
      const payload = {
        tutorId: user.id,
        subject,
        startTime,
        endTime,
        capacity: Number(capacity),
        location,
        description
      };
      const data = await createSlot(payload);
      setMsg(`Created slot #${data.id}`);
      setSubject(''); setStartTime(''); setEndTime(''); setCapacity(1); setLocation(''); setDescription('');
    } catch (err) {
      const text = err.response?.data?.error_description || err.message || 'Failed to create slot';
      setMsg('Error: ' + text);
    }
  };

  return (
    <div className="slot-container">
      <div className="slot-card">
        <div className="slot-header">
          <h3>Create Tutoring Slot</h3>
          <div>
            {!isAuthenticated && onShowLogin && (
              <button className="slot-button secondary" onClick={onShowLogin}>
                Login
              </button>
            )}
            {isAuthenticated && onLogout && (
              <button className="slot-button secondary" onClick={onLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
        <form className="slot-form" onSubmit={submit}>
          <div className="slot-input-group">
            <label>Subject</label>
            <input 
              className="slot-input"
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="e.g., Mathematics, Programming"
              required 
            />
          </div>
          <div className="slot-input-group">
            <label>Start Time</label>
            <input 
              className="slot-input"
              type="datetime-local" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
              required 
            />
          </div>
          <div className="slot-input-group">
            <label>End Time</label>
            <input 
              className="slot-input"
              type="datetime-local" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)} 
              required 
            />
          </div>
          <div className="slot-input-group">
            <label>Capacity</label>
            <input 
              className="slot-input"
              type="number" 
              min="1" 
              value={capacity} 
              onChange={(e) => setCapacity(e.target.value)} 
              placeholder="Number of students"
            />
          </div>
          <div className="slot-input-group">
            <label>Location</label>
            <input 
              className="slot-input"
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="Room number or online meeting link"
            />
          </div>
          <div className="slot-input-group">
            <label>Description</label>
            <textarea 
              className="slot-input"
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              placeholder="Topics covered, prerequisites, etc." 
            />
          </div>
          <div className="slot-button-group">
            <button type="submit" className="slot-button">Create Slot</button>
          </div>
        </form>
        {msg && <div className="slot-message">{msg}</div>}
      </div>
    </div>
  );
}


