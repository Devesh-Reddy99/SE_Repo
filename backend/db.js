const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use test database in test environment, otherwise use production database
const dbPath = process.env.NODE_ENV === 'test'
  ? path.join(__dirname, 'test.db')
  : path.join(__dirname, 'tutortribe.db');

let db = null;

// Initialize database connection
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
      } else {
        console.log(`Connected to database at ${dbPath}`);
        createTables();
        resolve();
      }
    });
  });
}

// Create database tables
function createTables() {
  if (!db) return;

  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student', 'tutor')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('Users table error:', err);
      }
    });

    // Slots table
    db.run(`CREATE TABLE IF NOT EXISTS slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      capacity INTEGER DEFAULT 1,
      booked INTEGER DEFAULT 0,
      location TEXT,
      description TEXT,
      status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tutor_id) REFERENCES users(id)
    )`, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('Slots table error:', err);
      }
    });

    // Bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (slot_id) REFERENCES slots(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('Bookings table error:', err);
      }
    });
  });
}

function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));
    db.get('SELECT id, username, password_hash, role FROM users WHERE username = ?', [username], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function createTutorSlot(slot) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));
    const sql = `INSERT INTO slots (tutor_id, subject, start_time, end_time, capacity, location, description, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      slot.tutorId,
      slot.subject,
      slot.startTime,
      slot.endTime,
      slot.capacity || 1,
      slot.location || null,
      slot.description || null,
      slot.status || 'available'
    ];
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

function getTutorSlots(tutorId, status) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));
    const where = [];
    const params = [];
    if (tutorId) { where.push('tutor_id = ?'); params.push(tutorId); }
    if (status) { where.push('status = ?'); params.push(status); }
    const sql = `SELECT id, tutor_id AS tutorId, subject, start_time AS startTime, 
                 end_time AS endTime, capacity, location, description, status
                 FROM slots ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY start_time ASC`;
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getSlotById(id) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));
    const sql = `SELECT id, tutor_id AS tutorId, subject, start_time AS startTime, 
                 end_time AS endTime, capacity, location, description, status 
                 FROM slots WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function updateTutorSlot(id, updates) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));
    const fields = [];
    const params = [];
    if (updates.subject !== undefined) { fields.push('subject = ?'); params.push(updates.subject); }
    if (updates.startTime !== undefined) { fields.push('start_time = ?'); params.push(updates.startTime); }
    if (updates.endTime !== undefined) { fields.push('end_time = ?'); params.push(updates.endTime); }
    if (updates.capacity !== undefined) { fields.push('capacity = ?'); params.push(updates.capacity); }
    if (updates.location !== undefined) { fields.push('location = ?'); params.push(updates.location); }
    if (updates.description !== undefined) { fields.push('description = ?'); params.push(updates.description); }
    if (updates.status !== undefined) { fields.push('status = ?'); params.push(updates.status); }

    if (fields.length === 0) return resolve({ changes: 0 });

    const sql = `UPDATE slots SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

// Initialize database indexes for performance optimization
function initializeIndexes() {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_slots_subject ON slots(subject)',
      'CREATE INDEX IF NOT EXISTS idx_slots_status ON slots(status)',
      'CREATE INDEX IF NOT EXISTS idx_slots_start_time ON slots(start_time)',
      'CREATE INDEX IF NOT EXISTS idx_slots_tutor_id ON slots(tutor_id)',
      'CREATE INDEX IF NOT EXISTS idx_slots_tutor_status ON slots(tutor_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_slots_location ON slots(location)'
    ];

    let completed = 0;
    const total = indexes.length;

    indexes.forEach(indexSql => {
      db.run(indexSql, (err) => {
        if (err) console.error('Index creation error:', err);
        completed++;
        if (completed === total) {
          resolve();
        }
      });
    });
  });
}

function searchSlots(searchTerm, filterType, filterValue) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));

    let sql = `SELECT s.id, s.tutor_id AS tutorId, u.username AS tutorName, s.subject, 
                      s.start_time AS startTime, s.end_time AS endTime, s.capacity, 
                      s.location, s.description, s.status
               FROM slots s
               LEFT JOIN users u ON s.tutor_id = u.id
               WHERE 1=1`;

    const params = [];

    // Build WHERE clause based on filter type
    if (filterType === 'all' && searchTerm) {
      // Search across subject, location, and tutor name
      sql += ' AND (s.subject LIKE ? OR s.location LIKE ? OR u.username LIKE ?)';
      const term = `%${searchTerm}%`;
      params.push(term, term, term);
    } else if (filterType === 'name' && searchTerm) {
      // Search by tutor name
      sql += ' AND u.username LIKE ?';
      params.push(`%${searchTerm}%`);
    } else if (filterType === 'subject' && searchTerm) {
      // Search by subject
      sql += ' AND s.subject LIKE ?';
      params.push(`%${searchTerm}%`);
    } else if (filterType === 'date' && filterValue) {
      // Search by date (match start date)
      sql += ' AND DATE(s.start_time) = ?';
      params.push(filterValue);
    }

    // Order by start time ascending
    sql += ' ORDER BY s.start_time ASC';

    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function getAvailableSlots() {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));

    const sql = `SELECT s.id, s.tutor_id AS tutorId, u.username AS tutorName, s.subject, 
                        s.start_time AS startTime, s.end_time AS endTime, s.capacity, 
                        s.location, s.description, s.status
                 FROM slots s
                 LEFT JOIN users u ON s.tutor_id = u.id
                 WHERE s.status = 'available'
                 ORDER BY s.start_time ASC`;

    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

module.exports = {
  getUserByUsername,
  createTutorSlot,
  getTutorSlots,
  getSlotById,
  updateTutorSlot,
  searchSlots,
  getAvailableSlots,
  initializeIndexes,
  initializeDatabase
};
