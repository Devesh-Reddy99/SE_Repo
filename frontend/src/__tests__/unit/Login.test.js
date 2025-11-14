import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../components/Login';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form with username and password inputs', () => {
    render(<Login onLoginSuccess={jest.fn()} />);

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<Login onLoginSuccess={jest.fn()} />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeInTheDocument();
  });

  test('renders login header', () => {
    render(<Login onLoginSuccess={jest.fn()} />);

    const header = screen.getByRole('heading', { name: /login/i });
    expect(header).toBeInTheDocument();
  });

  test('updates username field on input', () => {
    render(<Login onLoginSuccess={jest.fn()} />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    expect(usernameInput.value).toBe('testuser');
  });

  test('updates password field on input', () => {
    render(<Login onLoginSuccess={jest.fn()} />);

    const passwordInput = screen.getByPlaceholderText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  test('displays logging in message on submit', async () => {
    authService.login.mockImplementation(() => new Promise(() => {}));

    render(<Login onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Logging in\.\.\./i)).toBeInTheDocument();
    });
  });

  test('calls login service with normalized username', async () => {
    authService.login.mockResolvedValue({
      access_token: 'token123',
      user: { id: 1, username: 'testuser' }
    });

    render(<Login onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: '  TestUser  ' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('testuser', 'pass');
    });
  });

  test('stores access token in localStorage on success', async () => {
    authService.login.mockResolvedValue({
      access_token: 'token123',
      user: { id: 1, username: 'testuser' }
    });

    render(<Login onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'token123');
    });
  });

  test('stores user data in localStorage on success', async () => {
    const userData = { id: 1, username: 'testuser' };
    authService.login.mockResolvedValue({
      access_token: 'token123',
      user: userData
    });

    render(<Login onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(userData));
    });
  });

  test('displays success message on successful login', async () => {
    authService.login.mockResolvedValue({
      access_token: 'token123',
      user: { id: 1, username: 'testuser' }
    });

    render(<Login onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Login successful: testuser/i)).toBeInTheDocument();
    });
  });

  test('calls onLoginSuccess callback after successful login', async () => {
    authService.login.mockResolvedValue({
      access_token: 'token123',
      user: { id: 1, username: 'testuser' }
    });

    const onLoginSuccess = jest.fn();
    render(<Login onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  test('displays error message on login failure with status', async () => {
    authService.login.mockRejectedValue({
      response: {
        status: 401,
        data: { error_description: 'Invalid credentials' }
      }
    });

    render(<Login onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Error 401: Invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('displays error message on login failure without status', async () => {
    authService.login.mockRejectedValue({
      message: 'Network error'
    });

    render(<Login onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });

  test('handles error with response data message', async () => {
    authService.login.mockRejectedValue({
      response: {
        status: 500,
        data: { message: 'Server error' }
      }
    });

    render(<Login onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Error 500: Server error/i)).toBeInTheDocument();
    });
  });
});

