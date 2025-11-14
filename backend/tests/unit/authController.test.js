const db = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('../../controllers/authController');

// Mock dependencies
jest.mock('../../db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller - Token Endpoint', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {}
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('POST /api/auth/token', () => {
    describe('Grant Type Validation', () => {
      test('should reject unsupported grant_type', async () => {
        req.body = {
          grant_type: 'client_credentials',
          username: 'test@pesu.pes.edu',
          password: 'password123'
        };

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'unsupported_grant_type',
          error_description: 'Only password grant supported'
        });
      });

      test('should reject missing grant_type', async () => {
        req.body = {
          username: 'test@pesu.pes.edu',
          password: 'password123'
        };

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Required Field Validation', () => {
      test('should reject missing username', async () => {
        req.body = {
          grant_type: 'password',
          password: 'password123'
        };

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'invalid_request',
          error_description: 'Missing username or password'
        });
      });

      test('should reject missing password', async () => {
        req.body = {
          grant_type: 'password',
          username: 'test@pesu.pes.edu'
        };

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'invalid_request',
          error_description: 'Missing username or password'
        });
      });

      test('should reject both missing username and password', async () => {
        req.body = {
          grant_type: 'password'
        };

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Email Domain Validation', () => {
      test('should reject non-PESU email addresses', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@gmail.com',
          password: 'password123'
        };

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'invalid_request',
          error_description: 'Only PESU institutional emails ending with @pesu.pes.edu are allowed'
        });
      });

      test('should reject yahoo domain', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@yahoo.com',
          password: 'password123'
        };

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      test('should reject partial PESU domain match', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@notpesu.pes.edu',
          password: 'password123'
        };

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      test('should accept valid PESU email (case-insensitive)', async () => {
        req.body = {
          grant_type: 'password',
          username: 'STUDENT@PESU.PES.EDU',
          password: 'password123'
        };

        db.getUserByUsername.mockResolvedValue(null);

        await authController.token(req, res);

        // Should proceed past domain check (will fail on user lookup, but that's next)
        expect(db.getUserByUsername).toHaveBeenCalled();
      });
    });

    describe('User Lookup', () => {
      test('should return 401 when user not found', async () => {
        req.body = {
          grant_type: 'password',
          username: 'nonexistent@pesu.pes.edu',
          password: 'password123'
        };

        db.getUserByUsername.mockResolvedValue(null);

        await authController.token(req, res);

        expect(db.getUserByUsername).toHaveBeenCalledWith('nonexistent@pesu.pes.edu');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'invalid_grant',
          error_description: 'Invalid credentials'
        });
      });
    });

    describe('Password Verification', () => {
      test('should return 401 for invalid password', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@pesu.pes.edu',
          password: 'wrongpassword'
        };

        db.getUserByUsername.mockResolvedValue({
          id: 1,
          username: 'student@pesu.pes.edu',
          password_hash: '$2b$10$hashedpassword',
          role: 'student'
        });

        bcrypt.compare.mockResolvedValue(false);

        await authController.token(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', '$2b$10$hashedpassword');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'invalid_grant',
          error_description: 'Invalid credentials'
        });
      });
    });

    describe('Token Generation', () => {
      test('should return access token for valid credentials', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@pesu.pes.edu',
          password: 'password123'
        };

        const mockUser = {
          id: 1,
          username: 'student@pesu.pes.edu',
          password_hash: '$2b$10$hashedpassword',
          role: 'student'
        };

        db.getUserByUsername.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        jwt.sign
          .mockReturnValueOnce('mock_access_token')
          .mockReturnValueOnce('mock_refresh_token');

        await authController.token(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            token_type: 'Bearer',
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token',
            scope: 'read write',
            user: {
              id: 1,
              username: 'student@pesu.pes.edu',
              role: 'student'
            }
          })
        );
      });

      test('should set correct expiration time', async () => {
        req.body = {
          grant_type: 'password',
          username: 'tutor@pesu.pes.edu',
          password: 'password123'
        };

        const mockUser = {
          id: 2,
          username: 'tutor@pesu.pes.edu',
          password_hash: '$2b$10$hashedpassword',
          role: 'tutor'
        };

        db.getUserByUsername.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mock_token');

        await authController.token(req, res);

        // Check that jwt.sign was called with correct expiration
        expect(jwt.sign).toHaveBeenCalledWith(
          expect.objectContaining({ sub: 2, role: 'tutor' }),
          expect.any(String),
          expect.objectContaining({ expiresIn: expect.any(Number) })
        );
      });

      test('should include role in JWT payload', async () => {
        req.body = {
          grant_type: 'password',
          username: 'admin@pesu.pes.edu',
          password: 'password123'
        };

        const mockUser = {
          id: 3,
          username: 'admin@pesu.pes.edu',
          password_hash: '$2b$10$hashedpassword',
          role: 'admin'
        };

        db.getUserByUsername.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mock_token');

        await authController.token(req, res);

        expect(jwt.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            sub: 3,
            username: 'admin@pesu.pes.edu',
            role: 'admin'
          }),
          expect.any(String),
          expect.any(Object)
        );
      });
    });

    describe('Error Handling', () => {
      test('should return 500 on database error', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@pesu.pes.edu',
          password: 'password123'
        };

        db.getUserByUsername.mockRejectedValue(new Error('Database connection failed'));

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'server_error'
          })
        );
      });

      test('should return 500 on bcrypt error', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@pesu.pes.edu',
          password: 'password123'
        };

        db.getUserByUsername.mockResolvedValue({
          id: 1,
          username: 'student@pesu.pes.edu',
          password_hash: '$2b$10$hashedpassword',
          role: 'student'
        });

        bcrypt.compare.mockRejectedValue(new Error('Bcrypt error'));

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test('should return 500 on JWT generation error', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@pesu.pes.edu',
          password: 'password123'
        };

        db.getUserByUsername.mockResolvedValue({
          id: 1,
          username: 'student@pesu.pes.edu',
          password_hash: '$2b$10$hashedpassword',
          role: 'student'
        });

        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockImplementation(() => {
          throw new Error('JWT error');
        });

        await authController.token(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'server_error'
          })
        );
      });
    });

    describe('Response Format', () => {
      test('should include expires_in in response', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@pesu.pes.edu',
          password: 'password123'
        };

        db.getUserByUsername.mockResolvedValue({
          id: 1,
          username: 'student@pesu.pes.edu',
          password_hash: '$2b$10$hashedpassword',
          role: 'student'
        });

        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mock_token');

        await authController.token(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            expires_in: expect.any(Number)
          })
        );
      });

      test('should include user object with correct fields', async () => {
        req.body = {
          grant_type: 'password',
          username: 'student@pesu.pes.edu',
          password: 'password123'
        };

        db.getUserByUsername.mockResolvedValue({
          id: 1,
          username: 'student@pesu.pes.edu',
          password_hash: '$2b$10$hashedpassword',
          role: 'student'
        });

        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mock_token');

        await authController.token(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: {
              id: 1,
              username: 'student@pesu.pes.edu',
              role: 'student'
            }
          })
        );
      });
    });
  });
});
