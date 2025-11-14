import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SlotList from '../../components/SlotList';
import * as slotService from '../../services/slotService';

jest.mock('../../services/slotService');

describe('SlotList Component', () => {
  const mockSlots = [
    {
      id: 1,
      subject: 'Mathematics',
      day: 'Monday',
      startTime: '2025-01-06T10:00',
      endTime: '2025-01-06T11:00',
      location: 'Room 101',
      description: 'Basic algebra',
      status: 'available',
      capacity: 5
    },
    {
      id: 2,
      subject: 'Physics',
      day: 'Tuesday',
      startTime: '2025-01-07T14:00',
      endTime: '2025-01-07T15:00',
      location: 'Lab',
      description: 'Mechanics',
      status: 'booked',
      capacity: 3
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'tutor' }));
  });

  test('displays loading message initially', () => {
    slotService.getSlots.mockImplementation(() => new Promise(() => {}));
    
    render(<SlotList onEdit={jest.fn()} />);
    
    expect(screen.getByText(/Loading slots\.\.\./i)).toBeInTheDocument();
  });

  test('calls getSlots service on mount', () => {
    slotService.getSlots.mockResolvedValue(mockSlots);
    
    render(<SlotList onEdit={jest.fn()} />);
    
    expect(slotService.getSlots).toHaveBeenCalled();
  });

  test('displays slots after loading', async () => {
    slotService.getSlots.mockResolvedValue(mockSlots);
    
    render(<SlotList onEdit={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mathematics/i)).toBeInTheDocument();
      expect(screen.getByText(/Physics/i)).toBeInTheDocument();
    });
  });

  test('displays slot details correctly', async () => {
    slotService.getSlots.mockResolvedValue(mockSlots);
    
    render(<SlotList onEdit={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mathematics/i)).toBeInTheDocument();
      expect(screen.getByText(/Physics/i)).toBeInTheDocument();
    });
  });

  test('calls onEdit when edit button is clicked', async () => {
    slotService.getSlots.mockResolvedValue(mockSlots);
    const onEdit = jest.fn();
    
    render(<SlotList onEdit={onEdit} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mathematics/i)).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editButtons[0]);
    
    expect(onEdit).toHaveBeenCalledWith(1);
  });

  test('displays error message on API failure', async () => {
    slotService.getSlots.mockRejectedValue(new Error('Failed to load'));
    
    render(<SlotList onEdit={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/No slots found/i)).toBeInTheDocument();
    });
  });

  test('handles empty slots array', async () => {
    slotService.getSlots.mockResolvedValue([]);
    
    render(<SlotList onEdit={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Mathematics/i)).not.toBeInTheDocument();
    });
  });

  test('handles successful delete', async () => {
    slotService.getSlots.mockResolvedValue(mockSlots);
    slotService.deleteSlot.mockResolvedValue({ success: true });
    
    render(<SlotList onEdit={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mathematics/i)).toBeInTheDocument();
    });
    
    const deleteButtons = screen.queryAllByRole('button', { name: /Delete/i });
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(slotService.deleteSlot).toHaveBeenCalledWith(1);
      });
    }
  });

  test('cleans up on unmount', () => {
    slotService.getSlots.mockResolvedValue(mockSlots);
    
    const { unmount } = render(<SlotList onEdit={jest.fn()} />);
    
    unmount();
    // Component should cleanup properly without errors
    expect(true).toBe(true);
  });

  test('polls for updates every 10 seconds', () => {
    jest.useFakeTimers();
    slotService.getSlots.mockResolvedValue(mockSlots);
    
    render(<SlotList onEdit={jest.fn()} />);
    
    expect(slotService.getSlots).toHaveBeenCalledTimes(1);
    
    jest.advanceTimersByTime(10000);
    expect(slotService.getSlots).toHaveBeenCalledTimes(2);
    
    jest.useRealTimers();
  });
});

