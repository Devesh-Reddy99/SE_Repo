const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Public routes - anyone can view available slots
router.get('/available', slotController.getAvailableSlots);
router.get('/search', slotController.searchSlots);

// Protected routes below
router.use(authenticate);

// Student routes
router.post('/book/:id', requireRole('student'), slotController.bookSlot);

// Tutor routes
router.post('/create', requireRole('tutor'), slotController.createSlot);
router.put('/:id', requireRole('tutor'), slotController.updateSlot);
router.get('/myslots', requireRole('tutor'), slotController.getTutorSlots);

// Admin routes
router.get('/all', requireRole('admin'), slotController.getAllSlots);

module.exports = router;
