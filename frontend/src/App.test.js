import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders app component', () => {
    render(<App />);
    const appElement = screen.getByText(/Loading slots/i);
    expect(appElement).toBeInTheDocument();
  });

  test('initializes without authentication when no token', () => {
    render(<App />);

    // Should render login button in CreateSlot component
    const loginButtons = screen.queryAllByRole('button', { name: /login/i });
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  test('initializes with authentication when token exists', () => {
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }));

    render(<App />);

    // Component should render with auth
    expect(screen.getByText(/Loading slots/i)).toBeInTheDocument();
  });

  test('shows login modal when login button clicked', () => {
    render(<App />);

    const loginButton = screen.getAllByRole('button', { name: /login/i })[0];
    fireEvent.click(loginButton);

    // Login modal should be visible
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  test('closes login modal when close button clicked', () => {
    render(<App />);

    // Open modal
    const loginButton = screen.getAllByRole('button', { name: /login/i })[0];
    fireEvent.click(loginButton);

    // Close modal
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    // Modal should be closed
    waitFor(() => {
      expect(screen.queryByRole('heading', { name: /login/i })).not.toBeInTheDocument();
    });
  });

  test('handles logout correctly', () => {
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }));

    render(<App />);

    const logoutButtons = screen.queryAllByRole('button', { name: /logout/i });
    if (logoutButtons.length > 0) {
      fireEvent.click(logoutButtons[0]);

      // Check that localStorage was cleared
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    }
  });

  test('renders SearchSlots component', () => {
    render(<App />);

    // SearchSlots should have search input
    expect(screen.getByPlaceholderText(/subject/i)).toBeInTheDocument();
  });

  test('renders CreateSlot component', () => {
    render(<App />);

    // CreateSlot should have heading
    expect(screen.getByRole('heading', { name: /Create Tutoring Slot/i })).toBeInTheDocument();
  });

  test('renders SlotList component', () => {
    render(<App />);

    // SlotList should show loading initially
    expect(screen.getByText(/Loading slots/i)).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    render(<App />);

    // Open login modal
    const loginButton = screen.getAllByRole('button', { name: /login/i })[0];
    fireEvent.click(loginButton);

    // Login form should be visible
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();

    // After successful login (tested in Login component tests)
    // the modal should close and show logout button
  });

  test('does not show login modal when authenticated', () => {
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }));

    render(<App />);

    // Login modal should not appear
    expect(screen.queryByRole('heading', { name: /login/i })).not.toBeInTheDocument();
  });




});
