import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchSlots from '../../components/SearchSlots';
import * as slotService from '../../services/slotService';

jest.mock('../../services/slotService');

describe('SearchSlots Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    slotService.searchSlots.mockResolvedValue([]);
  });

  test('renders search component with title', () => {
    render(<SearchSlots />);
    expect(screen.getByText('Search Tutoring Slots')).toBeInTheDocument();
  });

  test('renders search input and button', () => {
    render(<SearchSlots />);
    expect(screen.getByPlaceholderText(/search by tutor name or subject/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('renders filter dropdown', () => {
    render(<SearchSlots />);
    expect(screen.getByDisplayValue('All Fields')).toBeInTheDocument();
  });

  test('renders clear filters button', () => {
    render(<SearchSlots />);
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  test('shows error when search term is empty', async () => {
    render(<SearchSlots />);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a search term/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('handles search with results', async () => {
    const mockResults = [
      {
        id: 1,
        subject: 'Mathematics',
        tutorName: 'John Doe',
        startTime: '2025-11-15T10:00:00',
        endTime: '2025-11-15T11:00:00',
        location: 'Room 101',
        capacity: 2,
        status: 'available'
      }
    ];
    
    slotService.searchSlots.mockResolvedValueOnce(mockResults);

    render(<SearchSlots />);
    
    const searchInput = screen.getByPlaceholderText(/search by tutor name or subject/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    await userEvent.type(searchInput, 'Mathematics');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(slotService.searchSlots).toHaveBeenCalled();
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('shows error message when no results found', async () => {
    slotService.searchSlots.mockResolvedValueOnce([]);

    render(<SearchSlots />);
    
    const searchInput = screen.getByPlaceholderText(/search by tutor name or subject/i);
    await userEvent.type(searchInput, 'NonExistent');
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/no slots found/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('clears results when clear filters button is clicked', async () => {
    const mockResults = [
      {
        id: 1,
        subject: 'Mathematics',
        tutorName: 'John Doe',
        startTime: '2025-11-15T10:00:00',
        endTime: '2025-11-15T11:00:00',
        location: 'Room 101',
        capacity: 2,
        status: 'available'
      }
    ];

    slotService.searchSlots.mockResolvedValueOnce(mockResults);

    render(<SearchSlots />);
    
    const searchInput = screen.getByPlaceholderText(/search by tutor name or subject/i);
    await userEvent.type(searchInput, 'Math');
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Mathematics')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('displays status badge with correct styling', async () => {
    const mockResults = [
      {
        id: 1,
        subject: 'Mathematics',
        tutorName: 'John Doe',
        startTime: '2025-11-15T10:00:00',
        endTime: '2025-11-15T11:00:00',
        location: 'Room 101',
        capacity: 2,
        status: 'available'
      }
    ];

    slotService.searchSlots.mockResolvedValueOnce(mockResults);

    render(<SearchSlots />);
    
    const searchInput = screen.getByPlaceholderText(/search by tutor name or subject/i);
    await userEvent.type(searchInput, 'Math');
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/available/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('shows loading state during search', async () => {
    slotService.searchSlots.mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve([
          {
            id: 1,
            subject: 'Mathematics',
            tutorName: 'John Doe',
            startTime: '2025-11-15T10:00:00',
            endTime: '2025-11-15T11:00:00',
            location: 'Room 101',
            capacity: 2,
            status: 'available'
          }
        ]), 100)
      )
    );

    render(<SearchSlots />);
    
    const searchInput = screen.getByPlaceholderText(/search by tutor name or subject/i);
    await userEvent.type(searchInput, 'Math');
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('handles multiple search requests correctly', async () => {
    const mockResults1 = [
      {
        id: 1,
        subject: 'Mathematics',
        tutorName: 'John Doe',
        startTime: '2025-11-15T10:00:00',
        endTime: '2025-11-15T11:00:00',
        location: 'Room 101',
        capacity: 2,
        status: 'available'
      }
    ];

    const mockResults2 = [
      {
        id: 2,
        subject: 'Physics',
        tutorName: 'Jane Smith',
        startTime: '2025-11-16T14:00:00',
        endTime: '2025-11-16T15:00:00',
        location: 'Room 202',
        capacity: 3,
        status: 'available'
      }
    ];

    slotService.searchSlots
      .mockResolvedValueOnce(mockResults1)
      .mockResolvedValueOnce(mockResults2);

    render(<SearchSlots />);
    
    const searchInput = screen.getByPlaceholderText(/search by tutor name or subject/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    await userEvent.type(searchInput, 'Math');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    }, { timeout: 3000 });

    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'Physics');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Physics')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('displays slot details in result cards', async () => {
    const mockResults = [
      {
        id: 1,
        subject: 'Mathematics',
        tutorName: 'John Doe',
        startTime: '2025-11-15T10:00:00',
        endTime: '2025-11-15T11:00:00',
        location: 'Room 101',
        capacity: 2,
        description: 'Algebra basics',
        status: 'available'
      }
    ];

    slotService.searchSlots.mockResolvedValueOnce(mockResults);

    render(<SearchSlots />);
    
    const searchInput = screen.getByPlaceholderText(/search by tutor name or subject/i);
    await userEvent.type(searchInput, 'Math');
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
