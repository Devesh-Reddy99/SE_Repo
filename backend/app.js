require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const slotsRoutes = require('./routes/slots');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize database (only once on startup)
if (process.env.NODE_ENV !== 'test') {
  db.initializeDatabase().then(() => {
    db.initializeIndexes().catch(err => console.error('Failed to initialize indexes:', err));
  }).catch(err => console.error('Failed to initialize database:', err));
}

// Basic CSP to allow dev frontend/backend communication in development
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        connectSrc: ['\'self\'', 'http://localhost:3000', 'http://localhost:4000'],
        scriptSrc: ['\'self\'', '\'unsafe-inline\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        imgSrc: ['\'self\'', 'data:']
      }
    }
  })
);

// Quietly respond to Chrome DevTools well-known probe to avoid 404 noise
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/admin', adminRoutes);

// basic health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}
module.exports = app; // exported for tests
