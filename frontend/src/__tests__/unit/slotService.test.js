import { getSlots, searchSlots, createSlot, updateSlot, getSlot, deleteSlot } from '../../services/slotService';
import axios from 'axios';

jest.mock('axios');

describe('slotService', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage before each test
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => mockToken),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });
  });

  describe('getSlots', () => {
    test('makes GET request to slots endpoint', async () => {
      const mockSlots = [{ id: 1, subject: 'Math' }];
      axios.get.mockResolvedValue({ data: mockSlots });

      const result = await getSlots();

      expect(axios.get).toHaveBeenCalled();
      expect(result).toEqual(mockSlots);
    });

    test('handles empty response', async () => {
      axios.get.mockResolvedValue({ data: [] });

      const result = await getSlots();

      expect(result).toEqual([]);
    });
  });

  describe('searchSlots', () => {
    test('makes GET request with search query', async () => {
      const mockSlots = [{ id: 1, subject: 'Math' }];
      axios.get.mockResolvedValue({ data: mockSlots });

      const result = await searchSlots('Math');

      expect(axios.get).toHaveBeenCalled();
      expect(result).toEqual(mockSlots);
    });

    test('returns empty array when no results', async () => {
      axios.get.mockResolvedValue({ data: [] });

      const result = await searchSlots('NonExistent');

      expect(result).toEqual([]);
    });
  });

  describe('getSlot', () => {
    test('fetches single slot by id', async () => {
      const mockSlot = { id: 1, subject: 'Math' };
      axios.get.mockResolvedValue({ data: mockSlot });

      const result = await getSlot(1);

      expect(axios.get).toHaveBeenCalled();
      expect(result).toEqual(mockSlot);
    });
  });

  describe('createSlot', () => {
    test('creates slot with authentication', async () => {
      const newSlot = { subject: 'Math', capacity: 5 };
      const createdSlot = { id: 1, ...newSlot };
      axios.post.mockResolvedValue({ data: createdSlot });

      const result = await createSlot(newSlot);

      expect(axios.post).toHaveBeenCalled();
      expect(result).toEqual(createdSlot);
    });

    test('throws error when not authenticated', async () => {
      window.localStorage.getItem = jest.fn(() => null);

      await expect(createSlot({})).rejects.toThrow('Not authenticated');
    });
  });

  describe('updateSlot', () => {
    test('updates slot with authentication', async () => {
      const updates = { subject: 'Physics' };
      const updatedSlot = { id: 1, ...updates };
      axios.put.mockResolvedValue({ data: updatedSlot });

      const result = await updateSlot(1, updates);

      expect(axios.put).toHaveBeenCalled();
      expect(result).toEqual(updatedSlot);
    });

    test('throws error when not authenticated', async () => {
      window.localStorage.getItem = jest.fn(() => null);

      await expect(updateSlot(1, {})).rejects.toThrow('Not authenticated');
    });
  });

  describe('deleteSlot', () => {
    test('deletes slot with authentication', async () => {
      axios.delete.mockResolvedValue({ data: { success: true } });

      const result = await deleteSlot(1);

      expect(axios.delete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    test('throws error when not authenticated', async () => {
      window.localStorage.getItem = jest.fn(() => null);

      await expect(deleteSlot(1)).rejects.toThrow('Not authenticated');
    });
  });
});
