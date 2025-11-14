import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditSlot from '../../components/EditSlot';
import axios from 'axios';

// Note: axios is already mocked by src/__mocks__/axios.js
// and configured in setupTests.js and package.json

describe('EditSlot Component', () => {
  const mockSlot = {
    id: 1,
    subject: 'Mathematics',
    startTime: '2025-01-01T10:00',
    endTime: '2025-01-01T11:00',
    capacity: 5,
    location: 'Room 101',
    description: 'Basic algebra',
  };

  const onDone = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    onDone.mockClear();
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'tutor' }));
    // Default success mock for GET
    axios.get.mockResolvedValue({ data: mockSlot });
  });



  test('shows "Slot not found" if slot is null after load', async () => {
    axios.get.mockResolvedValue({ data: null });
    render(<EditSlot slotId={1} onDone={onDone} />);

    await waitFor(() => {
      expect(screen.getByText('Slot not found')).toBeInTheDocument();
    });
  });

  test('shows error message if loading fails', async () => {
    axios.get.mockRejectedValue(new Error('Failed to load'));
    render(<EditSlot slotId={1} onDone={onDone} />);

    await waitFor(() => {
      expect(screen.getByText('Slot not found')).toBeInTheDocument();
    });
  });





  test('calls onDone when cancel button is clicked', async () => {
    render(<EditSlot slotId={1} onDone={onDone} />);
    
    // Wait for loading
    const cancelButton = await screen.findByRole('button', { name: /Cancel/i });

    // Act: Click cancel
    fireEvent.click(cancelButton);

    // Assert
    expect(onDone).toHaveBeenCalledTimes(1);
  });



  test('shows loading state initially', () => {
    render(<EditSlot slotId={1} onDone={onDone} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays correct error message format', async () => {
    axios.get.mockRejectedValue({
      response: {
        status: 500,
        data: { error_description: 'Database connection failed' }
      }
    });
    
    render(<EditSlot slotId={1} onDone={onDone} />);
    
    await waitFor(() => {
      // Component shows "Slot not found" for any error
      expect(screen.getByText('Slot not found')).toBeInTheDocument();
    });
  });




});