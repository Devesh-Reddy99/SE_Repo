const db = require('../../db');
const slotController = require('../../controllers/slotController');

describe('Slot Controller Search Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      user: { sub: 1 }
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('searchSlots', () => {
    it('should return search results with valid parameters', async () => {
      req.query = { searchTerm: 'Mathematics', filterType: 'subject' };

      jest.spyOn(db, 'searchSlots').mockResolvedValue([
        {
          id: 1,
          tutorId: 1,
          tutorName: 'John Doe',
          subject: 'Mathematics',
          startTime: '2025-11-15T10:00:00',
          endTime: '2025-11-15T11:00:00',
          capacity: 2,
          location: 'Room 101',
          status: 'available'
        }
      ]);

      await slotController.searchSlots(req, res);

      expect(db.searchSlots).toHaveBeenCalledWith('Mathematics', 'subject', '');
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 when no results found', async () => {
      req.query = { searchTerm: 'NonExistent', filterType: 'subject' };

      jest.spyOn(db, 'searchSlots').mockResolvedValue([]);

      await slotController.searchSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle search by date filter', async () => {
      req.query = { filterType: 'date', date: '2025-11-15' };

      jest.spyOn(db, 'searchSlots').mockResolvedValue([]);

      await slotController.searchSlots(req, res);

      expect(db.searchSlots).toHaveBeenCalledWith('', 'date', '2025-11-15');
    });

    it('should handle search by tutor name', async () => {
      req.query = { searchTerm: 'John', filterType: 'name' };

      jest.spyOn(db, 'searchSlots').mockResolvedValue([
        {
          id: 1,
          tutorId: 1,
          tutorName: 'John Doe',
          subject: 'Mathematics'
        }
      ]);

      await slotController.searchSlots(req, res);

      expect(db.searchSlots).toHaveBeenCalledWith('John', 'name', '');
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle server errors gracefully', async () => {
      req.query = { searchTerm: 'test', filterType: 'subject' };

      jest.spyOn(db, 'searchSlots').mockRejectedValue(new Error('Database error'));

      await slotController.searchSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'server_error' });
    });

    it('should use default filter type when not provided', async () => {
      req.query = { searchTerm: 'test' };

      jest.spyOn(db, 'searchSlots').mockResolvedValue([]);

      await slotController.searchSlots(req, res);

      expect(db.searchSlots).toHaveBeenCalledWith('test', 'all', '');
    });

    it('should handle empty search term with all filter type', async () => {
      req.query = { searchTerm: '', filterType: 'all' };

      jest.spyOn(db, 'searchSlots').mockResolvedValue([]);

      await slotController.searchSlots(req, res);

      expect(db.searchSlots).toHaveBeenCalledWith('', 'all', '');
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available slots', async () => {
      const mockSlots = [
        {
          id: 1,
          tutorId: 1,
          tutorName: 'John Doe',
          subject: 'Mathematics',
          status: 'available'
        },
        {
          id: 2,
          tutorId: 2,
          tutorName: 'Jane Smith',
          subject: 'Physics',
          status: 'available'
        }
      ];

      jest.spyOn(db, 'getAvailableSlots').mockResolvedValue(mockSlots);

      await slotController.getAvailableSlots(req, res);

      expect(db.getAvailableSlots).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockSlots);
    });

    it('should return empty array when no available slots', async () => {
      jest.spyOn(db, 'getAvailableSlots').mockResolvedValue([]);

      await slotController.getAvailableSlots(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors for available slots', async () => {
      jest.spyOn(db, 'getAvailableSlots').mockRejectedValue(new Error('Database error'));

      await slotController.getAvailableSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'server_error' });
    });
  });

  describe('getTutorSlots', () => {
    it('should return tutor slots when authenticated', async () => {
      const mockSlots = [
        {
          id: 1,
          tutorId: 1,
          subject: 'Mathematics',
          status: 'available'
        }
      ];

      jest.spyOn(db, 'getTutorSlots').mockResolvedValue(mockSlots);

      await slotController.getTutorSlots(req, res);

      expect(db.getTutorSlots).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockSlots);
    });

    it('should return 401 when not authenticated', async () => {
      req.user = undefined;

      await slotController.getTutorSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(db, 'getTutorSlots').mockRejectedValue(new Error('Database error'));

      await slotController.getTutorSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('bookSlot', () => {
    it('should book a slot successfully', async () => {
      req.params = { id: 1 };
      const mockSlot = {
        id: 1,
        tutorId: 2,
        subject: 'Mathematics',
        status: 'available'
      };

      jest.spyOn(db, 'getSlotById').mockResolvedValue(mockSlot);
      jest.spyOn(db, 'updateTutorSlot').mockResolvedValue({ changes: 1 });

      await slotController.bookSlot(req, res);

      expect(res.json).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      req.user = undefined;
      req.params = { id: 1 };

      await slotController.bookSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 when slot not found', async () => {
      req.params = { id: 999 };

      jest.spyOn(db, 'getSlotById').mockResolvedValue(null);

      await slotController.bookSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return error when slot is not available', async () => {
      req.params = { id: 1 };
      const mockSlot = {
        id: 1,
        status: 'booked'
      };

      jest.spyOn(db, 'getSlotById').mockResolvedValue(mockSlot);

      await slotController.bookSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle database errors', async () => {
      req.params = { id: 1 };
      jest.spyOn(db, 'getSlotById').mockRejectedValue(new Error('Database error'));

      await slotController.bookSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createSlot', () => {
    it('should create a slot successfully', async () => {
      req.body = {
        subject: 'Mathematics',
        startTime: '2025-11-15T10:00:00',
        endTime: '2025-11-15T11:00:00',
        capacity: 5,
        location: 'Room 101',
        description: 'Basic math class'
      };

      jest.spyOn(db, 'createTutorSlot').mockResolvedValue({ id: 1 });

      await slotController.createSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 401 when not authenticated', async () => {
      req.user = undefined;
      req.body = { subject: 'Math', startTime: '2025-11-15T10:00:00', endTime: '2025-11-15T11:00:00' };

      await slotController.createSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 400 when missing required fields', async () => {
      req.body = { subject: 'Math' };

      await slotController.createSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'invalid_request' })
      );
    });

    it('should use default capacity when not provided', async () => {
      req.body = {
        subject: 'Physics',
        startTime: '2025-11-15T10:00:00',
        endTime: '2025-11-15T11:00:00'
      };

      jest.spyOn(db, 'createTutorSlot').mockResolvedValue({ id: 2 });

      await slotController.createSlot(req, res);

      expect(db.createTutorSlot).toHaveBeenCalledWith(
        expect.objectContaining({ capacity: 1 })
      );
    });

    it('should handle database errors', async () => {
      req.body = {
        subject: 'Math',
        startTime: '2025-11-15T10:00:00',
        endTime: '2025-11-15T11:00:00'
      };

      jest.spyOn(db, 'createTutorSlot').mockRejectedValue(new Error('Database error'));

      await slotController.createSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getSlots', () => {
    it('should get slots with no filters', async () => {
      const mockSlots = [{ id: 1, subject: 'Math' }];
      jest.spyOn(db, 'getTutorSlots').mockResolvedValue(mockSlots);

      await slotController.getSlots(req, res);

      expect(db.getTutorSlots).toHaveBeenCalledWith(undefined, undefined);
      expect(res.json).toHaveBeenCalledWith(mockSlots);
    });

    it('should filter by tutorId', async () => {
      req.query = { tutorId: '1' };
      const mockSlots = [{ id: 1, tutorId: 1, subject: 'Math' }];
      jest.spyOn(db, 'getTutorSlots').mockResolvedValue(mockSlots);

      await slotController.getSlots(req, res);

      expect(db.getTutorSlots).toHaveBeenCalledWith('1', undefined);
      expect(res.json).toHaveBeenCalledWith(mockSlots);
    });

    it('should filter by status', async () => {
      req.query = { status: 'available' };
      const mockSlots = [{ id: 1, status: 'available' }];
      jest.spyOn(db, 'getTutorSlots').mockResolvedValue(mockSlots);

      await slotController.getSlots(req, res);

      expect(db.getTutorSlots).toHaveBeenCalledWith(undefined, 'available');
    });

    it('should handle database errors', async () => {
      jest.spyOn(db, 'getTutorSlots').mockRejectedValue(new Error('Database error'));

      await slotController.getSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getSlotById', () => {
    it('should return slot by id', async () => {
      req.params = { id: '1' };
      const mockSlot = { id: 1, subject: 'Math' };
      jest.spyOn(db, 'getSlotById').mockResolvedValue(mockSlot);

      await slotController.getSlotById(req, res);

      expect(db.getSlotById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockSlot);
    });

    it('should return 404 when slot not found', async () => {
      req.params = { id: '999' };
      jest.spyOn(db, 'getSlotById').mockResolvedValue(null);

      await slotController.getSlotById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle database errors', async () => {
      req.params = { id: '1' };
      jest.spyOn(db, 'getSlotById').mockRejectedValue(new Error('Database error'));

      await slotController.getSlotById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateSlot', () => {
    it('should update slot when user is owner', async () => {
      req.params = { id: '1' };
      req.body = { subject: 'Advanced Math' };
      const mockSlot = { id: 1, tutorId: 1 };

      jest.spyOn(db, 'getSlotById').mockResolvedValue(mockSlot);
      jest.spyOn(db, 'updateTutorSlot').mockResolvedValue({ changes: 1 });

      await slotController.updateSlot(req, res);

      expect(db.updateTutorSlot).toHaveBeenCalledWith('1', { subject: 'Advanced Math' });
      expect(res.json).toHaveBeenCalledWith({ updated: 1 });
    });

    it('should return 401 when not authenticated', async () => {
      req.user = undefined;
      req.params = { id: '1' };

      await slotController.updateSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 when slot not found', async () => {
      req.params = { id: '999' };
      jest.spyOn(db, 'getSlotById').mockResolvedValue(null);

      await slotController.updateSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 when user is not slot owner', async () => {
      req.params = { id: '1' };
      req.body = { subject: 'Math' };
      req.user = { sub: 1 };
      const mockSlot = { id: 1, tutorId: 2 };

      jest.spyOn(db, 'getSlotById').mockResolvedValue(mockSlot);

      await slotController.updateSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should handle multiple field updates', async () => {
      req.params = { id: '1' };
      req.body = {
        subject: 'Advanced Math',
        capacity: 10,
        location: 'Room 201',
        status: 'cancelled'
      };
      const mockSlot = { id: 1, tutorId: 1 };

      jest.spyOn(db, 'getSlotById').mockResolvedValue(mockSlot);
      jest.spyOn(db, 'updateTutorSlot').mockResolvedValue({ changes: 1 });

      await slotController.updateSlot(req, res);

      expect(db.updateTutorSlot).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          subject: 'Advanced Math',
          capacity: 10,
          location: 'Room 201',
          status: 'cancelled'
        })
      );
    });

    it('should handle database errors', async () => {
      req.params = { id: '1' };
      req.body = { subject: 'Math' };
      const mockSlot = { id: 1, tutorId: 1 };

      jest.spyOn(db, 'getSlotById').mockResolvedValue(mockSlot);
      jest.spyOn(db, 'updateTutorSlot').mockRejectedValue(new Error('Database error'));

      await slotController.updateSlot(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAllSlots', () => {
    it('should return all slots', async () => {
      const mockSlots = [
        { id: 1, subject: 'Math' },
        { id: 2, subject: 'Physics' }
      ];
      jest.spyOn(db, 'getTutorSlots').mockResolvedValue(mockSlots);

      await slotController.getAllSlots(req, res);

      expect(db.getTutorSlots).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith(mockSlots);
    });

    it('should return empty array when no slots', async () => {
      jest.spyOn(db, 'getTutorSlots').mockResolvedValue([]);

      await slotController.getAllSlots(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      jest.spyOn(db, 'getTutorSlots').mockRejectedValue(new Error('Database error'));

      await slotController.getAllSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
