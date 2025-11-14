import React, { useEffect, useState } from 'react';
import { getSlots } from '../services/slotService';

export default function SlotList({ onEdit }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const rows = await getSlots(user ? { tutorId: user.id } : {});
        if (mounted) setSlots(rows);
      } catch (err) {
        setMsg('Failed to load slots');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (loading) return <div>Loading slots...</div>;
  if (!slots.length) return <div>No slots found.</div>;

  return (
    <div className="slot-list">
      <div className="slot-list-header">
        <h4>Your Tutoring Slots</h4>
      </div>
      <div className="slot-items">
        {slots.map(s => (
          <div key={s.id} className="slot-item">
            <div className="slot-item-content">
              <h5>{s.subject}</h5>
              <p>{new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}</p>
              <p>{s.location || 'Online'} • Capacity: {s.capacity}</p>
            </div>
            <div className="slot-item-actions">
              <button className="slot-button" onClick={() => onEdit && onEdit(s.id)}>
                Edit Slot
              </button>
            </div>
          </div>
        ))}
      </div>
      {msg && <div className="slot-message">{msg}</div>}
    </div>
  );
}
