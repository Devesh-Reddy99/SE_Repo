// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/authMiddleware');

// Admin only route - view all users
router.get('/users', requireRole('admin'), (req, res) => {
  res.json({
    message: 'All users retrieved successfully',
    users: [
      { id: 1, username: 'teststudent@pesu.pes.edu', role: 'student' },
      { id: 2, username: 'testtutor@pesu.pes.edu', role: 'tutor' },
      { id: 3, username: 'testadmin@pesu.pes.edu', role: 'admin' }
    ]
  });
});

// Admin only route - view all bookings
router.get('/bookings', requireRole('admin'), (req, res) => {
  res.json({
    message: 'All bookings retrieved successfully',
    bookings: [
      { id: 1, student: 'student1@pesu.pes.edu', tutor: 'tutor1@pesu.pes.edu', slotId: 1 },
      { id: 2, student: 'student2@pesu.pes.edu', tutor: 'tutor1@pesu.pes.edu', slotId: 2 }
    ]
  });
});

// Admin only route - view user profile (admin can view all)
router.get('/users/:userId', requireRole('admin'), (req, res) => {
  const { userId } = req.params;
  res.json({
    message: `User ${userId} profile retrieved successfully`,
    user: {
      id: parseInt(userId),
      username: 'user@pesu.pes.edu',
      role: 'student',
      createdAt: '2025-01-01'
    }
  });
});

module.exports = router;

