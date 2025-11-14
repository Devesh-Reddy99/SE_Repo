import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditSlot from '../../components/EditSlot';
import * as slotService from '../../services/slotService';

jest.mock('../../services/slotService');

describe('EditSlot - Extended Coverage', () => {
  const mockSlot = {
    id: 1,
    subject: 'Math',
    startTime: '2024-01-15T10:00',
    endTime: '2024-01-15T11:00',
    capacity: 5,
    location: 'Room 101',
    description: 'Algebra basics'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    slotService.getSlot.mockResolvedValue(mockSlot);
  });

  test('loads and displays slot data', async () => {
    render(<EditSlot slotId={1} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Room 101')).toBeInTheDocument();
  });

  test('updates subject field', async () => {
    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
    });

    const subjectInput = screen.getByDisplayValue('Math');
    fireEvent.change(subjectInput, { target: { value: 'Physics' } });

    expect(screen.getByDisplayValue('Physics')).toBeInTheDocument();
  });

  test('updates capacity field', async () => {
    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    const capacityInput = screen.getByDisplayValue('5');
    fireEvent.change(capacityInput, { target: { value: '10' } });

    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  test('updates location field', async () => {
    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Room 101')).toBeInTheDocument();
    });

    const locationInput = screen.getByDisplayValue('Room 101');
    fireEvent.change(locationInput, { target: { value: 'Room 202' } });

    expect(screen.getByDisplayValue('Room 202')).toBeInTheDocument();
  });

  test('updates description field', async () => {
    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Algebra basics')).toBeInTheDocument();
    });

    const descriptionInput = screen.getByDisplayValue('Algebra basics');
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

    expect(screen.getByDisplayValue('Updated description')).toBeInTheDocument();
  });

  test('shows cancel button when onDone is provided', async () => {
    const mockOnDone = jest.fn();
    render(<EditSlot slotId={1} onDone={mockOnDone} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnDone).toHaveBeenCalled();
  });

  test('does not show cancel button when onDone is not provided', async () => {
    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  test('submits updated slot data', async () => {
    slotService.updateSlot.mockResolvedValue({ ...mockSlot, subject: 'Physics' });
    const mockOnDone = jest.fn();

    render(<EditSlot slotId={1} onDone={mockOnDone} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
    });

    const subjectInput = screen.getByDisplayValue('Math');
    fireEvent.change(subjectInput, { target: { value: 'Physics' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(slotService.updateSlot).toHaveBeenCalledWith(1, expect.objectContaining({
        subject: 'Physics'
      }));
    });
  });

  test('shows saving message during submission', async () => {
    slotService.updateSlot.mockResolvedValue(mockSlot);

    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  test('shows saved message after successful submission', async () => {
    slotService.updateSlot.mockResolvedValue(mockSlot);

    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
  });

  test('shows error message on save failure', async () => {
    slotService.updateSlot.mockRejectedValue(new Error('Update failed'));

    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/error saving/i)).toBeInTheDocument();
    });
  });

  test('handles empty location field', async () => {
    const slotWithoutLocation = { ...mockSlot, location: null };
    slotService.getSlot.mockResolvedValue(slotWithoutLocation);

    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
    });

    const locationInputs = screen.getAllByRole('textbox');
    const locationInput = locationInputs.find(input => input.type === 'text' && input.value === '');
    expect(locationInput).toBeTruthy();
  });

  test('handles empty description field', async () => {
    const slotWithoutDescription = { ...mockSlot, description: null };
    slotService.getSlot.mockResolvedValue(slotWithoutDescription);

    render(<EditSlot slotId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
    });

    const textareas = screen.getAllByRole('textbox');
    const textarea = textareas.find(el => el.tagName === 'TEXTAREA');
    expect(textarea).toBeTruthy();
  });
});
