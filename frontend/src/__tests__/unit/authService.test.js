import { login } from '../../services/authService';
import axios from 'axios';

jest.mock('axios');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('makes POST request to login endpoint', async () => {
      const mockResponse = {
        data: {
          access_token: 'token123',
          user: { id: 1, username: 'testuser' }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      await login('testuser', 'password123');

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/token'),
        expect.objectContaining({
          username: 'testuser',
          password: 'password123',
          grant_type: 'password'
        })
      );
    });

    test('returns login response data', async () => {
      const mockResponse = {
        data: {
          access_token: 'token123',
          user: { id: 1, username: 'testuser' }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await login('testuser', 'password123');

      expect(result).toEqual(mockResponse.data);
    });

    test('throws error on failed login', async () => {
      axios.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(login('testuser', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });
  });
});
