const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const TEST_DB_PATH = path.join(__dirname, '../test.db');

// Create and initialize test database
function setupTestDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(TEST_DB_PATH, (err) => {
      if (err) return reject(err);

      // Create tables
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

        // Create indexes
        db.run(`CREATE INDEX IF NOT EXISTS idx_slots_subject ON slots(subject)`, () => {});
        db.run(`CREATE INDEX IF NOT EXISTS idx_slots_status ON slots(status)`, () => {});
        db.run(`CREATE INDEX IF NOT EXISTS idx_slots_start_time ON slots(start_time)`, () => {});
        db.run(`CREATE INDEX IF NOT EXISTS idx_slots_tutor_id ON slots(tutor_id)`, () => {});
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`, () => {});

        // Insert test data
        const hashPassword = async () => {
          const testPassword = await bcrypt.hash('password123', 10);

          // Clear existing test data
          db.run('DELETE FROM bookings');
          db.run('DELETE FROM slots');
          db.run('DELETE FROM users', (err) => {
            if (err) console.error('Clear users error:', err);

            // Insert test users
            db.run(
              `INSERT INTO users (username, email, password_hash, role) 
               VALUES (?, ?, ?, ?)`,
              ['teststudent@pesu.pes.edu', 'teststudent@pesu.pes.edu', testPassword, 'student'],
              (err) => {
                if (err) console.error('Insert student error:', err);
              }
            );

            db.run(
              `INSERT INTO users (username, email, password_hash, role) 
               VALUES (?, ?, ?, ?)`,
              ['testtutor@pesu.pes.edu', 'testtutor@pesu.pes.edu', testPassword, 'tutor'],
              (err) => {
                if (err) console.error('Insert tutor error:', err);
              }
            );

            db.run(
              `INSERT INTO users (username, email, password_hash, role) 
               VALUES (?, ?, ?, ?)`,
              ['testadmin@pesu.pes.edu', 'testadmin@pesu.pes.edu', testPassword, 'admin'],
              (err) => {
                if (err) console.error('Insert admin error:', err);
              }
            );

            // Insert test slots (after tutor is created)
            setTimeout(() => {
              db.get('SELECT id FROM users WHERE username = ?', ['testtutor@pesu.pes.edu'], (err, tutor) => {
                if (err || !tutor) {
                  console.error('Could not find tutor:', err);
                  db.close();
                  resolve(db);
                  return;
                }

                const startTime = new Date();
                startTime.setHours(startTime.getHours() + 1);
                const endTime = new Date(startTime);
                endTime.setHours(endTime.getHours() + 1);

                db.run(
                  `INSERT INTO slots (tutor_id, subject, start_time, end_time, capacity, status)
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [tutor.id, 'Mathematics', startTime.toISOString(), endTime.toISOString(), 5, 'available'],
                  (err) => {
                    if (err) console.error('Insert slot error:', err);
                    db.close();
                    resolve(db);
                  }
                );
              });
            }, 100);
          });
        };

        hashPassword().catch((err) => {
          console.error('Hash password error:', err);
          db.close();
          reject(err);
        });
      });
    });
  });
}

// Clean up test database
function cleanupTestDatabase() {
  return new Promise((resolve) => {
    try {
      const fs = require('fs');
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
      }
      resolve();
    } catch (err) {
      console.error('Cleanup error:', err);
      resolve();
    }
  });
}

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  TEST_DB_PATH
};
