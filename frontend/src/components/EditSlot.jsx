import React, { useEffect, useState } from 'react';
import { getSlot, updateSlot } from '../services/slotService';

export default function EditSlot({ slotId, onDone }) {
  const [loading, setLoading] = useState(true);
  const [slot, setSlot] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getSlot(slotId);
        if (mounted) setSlot(data);
      } catch (err) {
        setMsg('Failed to load slot');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [slotId]);

  if (loading) return <div>Loading...</div>;
  if (!slot) return <div>Slot not found</div>;

  const submit = async (e) => {
    e.preventDefault();
    setMsg('Saving...');
    try {
      const payload = {
        subject: slot.subject,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity,
        location: slot.location,
        description: slot.description
      };
      await updateSlot(slotId, payload);
      setMsg('Saved');
      if (onDone) setTimeout(() => onDone(), 400);
    } catch (err) {
      setMsg('Error saving slot');
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '24px auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h3>Edit Slot #{slotId}</h3>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label>Subject</label>
          <input value={slot.subject} onChange={(e) => setSlot({ ...slot, subject: e.target.value })} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Start Time</label>
          <input type="datetime-local" value={slot.startTime} onChange={(e) => setSlot({ ...slot, startTime: e.target.value })} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>End Time</label>
          <input type="datetime-local" value={slot.endTime} onChange={(e) => setSlot({ ...slot, endTime: e.target.value })} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Capacity</label>
          <input type="number" min="1" value={slot.capacity} onChange={(e) => setSlot({ ...slot, capacity: Number(e.target.value) })} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Location</label>
          <input value={slot.location || ''} onChange={(e) => setSlot({ ...slot, location: e.target.value })} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Description</label>
          <textarea value={slot.description || ''} onChange={(e) => setSlot({ ...slot, description: e.target.value })} rows={3} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 12px' }}>Save</button>
          {onDone && <button type="button" onClick={onDone} style={{ padding: '8px 12px' }}>Cancel</button>}
        </div>
      </form>
      <div style={{ marginTop: 12 }}>{msg}</div>
    </div>
  );
}
