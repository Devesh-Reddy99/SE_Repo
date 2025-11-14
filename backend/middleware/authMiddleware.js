const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * Middleware to authenticate JWT token
 * Verifies the Bearer token and attaches user info to req.user
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'Missing or invalid authorization header. Expected: Bearer <token>'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.sub,
        username: decoded.username,
        role: decoded.role
      };
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'unauthorized',
          error_description: 'Token has expired'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'unauthorized',
          error_description: 'Invalid token'
        });
      }
      throw jwtError;
    }
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error during authentication'
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * Usage: authorize(['admin', 'tutor']) - allows admin or tutor
 *        authorize(['admin']) - allows only admin
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'forbidden',
        error_description: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Convenience middleware: authenticate + authorize in one
 * Usage: requireRole('admin') or requireRole(['admin', 'tutor'])
 */
const requireRole = (...allowedRoles) => {
  return [authenticate, authorize(...allowedRoles)];
};

module.exports = {
  authenticate,
  authorize,
  requireRole
};