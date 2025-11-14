import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateSlot from '../../components/CreateSlot';
import * as slotService from '../../services/slotService';

jest.mock('../../services/slotService');

describe('CreateSlot Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'tutor' }));
  });

  test('renders create slot form with all fields', () => {
    render(<CreateSlot isAuthenticated={true} onLogout={jest.fn()} onShowLogin={jest.fn()} />);

    expect(screen.getByPlaceholderText(/e\.g\., Mathematics, Programming/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Number of students/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Room number or online meeting link/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Topics covered, prerequisites, etc\./i)).toBeInTheDocument();
  });

  test('shows login button when not authenticated', () => {
    render(<CreateSlot isAuthenticated={false} onLogout={jest.fn()} onShowLogin={jest.fn()} />);

    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test('shows logout button when authenticated', () => {
    render(<CreateSlot isAuthenticated={true} onLogout={jest.fn()} onShowLogin={jest.fn()} />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  test('calls onShowLogin when login button clicked', () => {
    const onShowLogin = jest.fn();
    render(<CreateSlot isAuthenticated={false} onLogout={jest.fn()} onShowLogin={onShowLogin} />);

    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(onShowLogin).toHaveBeenCalled();
  });

  test('calls onLogout when logout button clicked', () => {
    const onLogout = jest.fn();
    render(<CreateSlot isAuthenticated={true} onLogout={onLogout} onShowLogin={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(onLogout).toHaveBeenCalled();
  });

  test('updates subject field on input', () => {
    render(<CreateSlot isAuthenticated={true} onLogout={jest.fn()} onShowLogin={jest.fn()} />);

    const input = screen.getByPlaceholderText(/e\.g\., Mathematics, Programming/i);
    fireEvent.change(input, { target: { value: 'Math' } });
    expect(input.value).toBe('Math');
  });

  test('updates all form fields correctly', () => {
    render(<CreateSlot isAuthenticated={true} onLogout={jest.fn()} onShowLogin={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/e\.g\., Mathematics, Programming/i), { target: { value: 'Math' } });
    fireEvent.change(screen.getByPlaceholderText(/Number of students/i), { target: { value: '5' } });
    fireEvent.change(screen.getByPlaceholderText(/Room number or online meeting link/i), { target: { value: 'Room 101' } });
    fireEvent.change(screen.getByPlaceholderText(/Topics covered, prerequisites, etc\./i), { target: { value: 'Algebra' } });

    expect(screen.getByPlaceholderText(/e\.g\., Mathematics, Programming/i).value).toBe('Math');
    expect(screen.getByPlaceholderText(/Number of students/i).value).toBe('5');
    expect(screen.getByPlaceholderText(/Room number or online meeting link/i).value).toBe('Room 101');
    expect(screen.getByPlaceholderText(/Topics covered, prerequisites, etc\./i).value).toBe('Algebra');
  });

  test('shows error when submitting without authentication', async () => {
    localStorage.removeItem('user');
    render(<CreateSlot isAuthenticated={false} onLogout={jest.fn()} onShowLogin={jest.fn()} />);

    fireEvent.submit(screen.getByRole('button', { name: /Create Slot/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Please login first/i)).toBeInTheDocument();
    });
  });











  test('calls onShowLogin when not authenticated on submit', async () => {
    const onShowLogin = jest.fn();
    localStorage.removeItem('user');

    render(<CreateSlot isAuthenticated={false} onLogout={jest.fn()} onShowLogin={onShowLogin} />);

    fireEvent.submit(screen.getByRole('button', { name: /Create Slot/i }).closest('form'));

    await waitFor(() => {
      expect(onShowLogin).toHaveBeenCalled();
    });
  });



});

