// backend/controllers/authController.js
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || 1800;

exports.token = async (req, res) => {
  try {
    const { grant_type, username, password } = req.body;

    if (grant_type !== 'password') {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only password grant supported'
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing username or password'
      });
    }

    // ✅ Step 1: Enforce PESU email domain policy
    const allowedDomain = '@pesu.pes.edu';
    if (!username.toLowerCase().endsWith(allowedDomain)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: `Only PESU institutional emails ending with ${allowedDomain} are allowed`
      });
    }

    // continue with existing user lookup & password verification...
    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'Invalid credentials'
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'Invalid credentials'
      });
    }

    // generate tokens (same as before)
    const access_token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: parseInt(JWT_EXPIRES_IN, 10) }
    );

    const refresh_token = jwt.sign(
      { sub: user.id },
      JWT_SECRET,
      { expiresIn: 7 * 24 * 3600 } // 7 days
    );

    return res.json({
      token_type: 'Bearer',
      access_token,
      expires_in: parseInt(JWT_EXPIRES_IN, 10),
      refresh_token,
      scope: 'read write',
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error('Token error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({
      error: 'server_error',
      error_description: err.message || 'Internal server error',
      // Only include details in development
      ...(process.env.NODE_ENV !== 'production' && { details: err.stack })
    });
  }
};
