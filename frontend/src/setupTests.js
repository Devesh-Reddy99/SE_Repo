// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock axios - must be before any imports of components using axios
jest.mock('axios');

// Mock localStorage for tests - must be defined before beforeEach
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Reset mocks before each test but DON'T clear localStorage automatically
// Tests should clear it themselves if needed
beforeEach(() => {
  jest.clearAllMocks();
  // Don't call localStorageMock.clear() here - let tests manage their own state
});
