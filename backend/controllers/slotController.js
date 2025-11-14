const db = require('../db');

// Create a new slot. Only authenticated user can create; tutor identity comes from req.user.sub
exports.createSlot = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const { subject, startTime, endTime, capacity, location, description } = req.body;
    if (!subject || !startTime || !endTime) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Missing required fields' });
    }

    const slot = {
      tutorId: userId,
      subject,
      startTime,
      endTime,
      capacity: capacity || 1,
      location: location || null,
      description: description || null,
      status: 'available'
    };

    const result = await db.createTutorSlot(slot);
    return res.status(201).json({ id: result.id });
  } catch (err) {
    console.error('createSlot error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.getSlots = async (req, res) => {
  try {
    const tutorId = req.query.tutorId;
    const status = req.query.status;
    const rows = await db.getTutorSlots(tutorId, status);
    return res.json(rows);
  } catch (err) {
    console.error('getSlots error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.getSlotById = async (req, res) => {
  try {
    const id = req.params.id;
    const row = await db.getSlotById(id);
    if (!row) return res.status(404).json({ error: 'not_found' });
    return res.json(row);
  } catch (err) {
    console.error('getSlotById error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const slot = await db.getSlotById(id);
    if (!slot) return res.status(404).json({ error: 'not_found' });
    if (String(slot.tutorId) !== String(userId)) {
      return res.status(403).json({ error: 'forbidden', error_description: 'Not the slot owner' });
    }

    const updates = {};
    ['subject', 'startTime', 'endTime', 'capacity', 'location', 'description', 'status'].forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const result = await db.updateTutorSlot(id, updates);
    return res.json({ updated: result.changes });
  } catch (err) {
    console.error('updateSlot error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.searchSlots = async (req, res) => {
  try {
    const { searchTerm = '', filterType = 'all', date = '', subject = '' } = req.query;
    
    // Determine filter value based on filter type
    let filterValue = '';
    if (filterType === 'date') {
      filterValue = date;
    } else if (filterType === 'subject') {
      filterValue = subject;
    }

    const rows = await db.searchSlots(searchTerm, filterType, filterValue);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'not_found', error_description: 'No slots found matching your criteria' });
    }
    
    return res.json(rows);
  } catch (err) {
    console.error('searchSlots error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const rows = await db.getAvailableSlots();
    return res.json(rows || []);
  } catch (err) {
    console.error('getAvailableSlots error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.getTutorSlots = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    
    const rows = await db.getTutorSlots(userId);
    return res.json(rows || []);
  } catch (err) {
    console.error('getTutorSlots error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    const studentId = req.user?.sub;
    
    if (!studentId) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const slot = await db.getSlotById(slotId);
    if (!slot) {
      return res.status(404).json({ error: 'not_found', error_description: 'Slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Slot is not available for booking' });
    }

    // Update slot status to booked (simplified - in real app, track bookings)
    await db.updateTutorSlot(slotId, { status: 'booked' });
    
    return res.json({ success: true, message: 'Slot booked successfully' });
  } catch (err) {
    console.error('bookSlot error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.getAllSlots = async (req, res) => {
  try {
    const rows = await db.getTutorSlots();
    return res.json(rows || []);
  } catch (err) {
    console.error('getAllSlots error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};
