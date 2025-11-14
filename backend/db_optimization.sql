-- Database Optimization for Search Performance
-- Add indexes to improve search query performance

-- Index on subject for faster subject-based searches
CREATE INDEX IF NOT EXISTS idx_slots_subject ON slots(subject);

-- Index on status for faster filtering by availability
CREATE INDEX IF NOT EXISTS idx_slots_status ON slots(status);

-- Index on start_time for faster date-based searches
CREATE INDEX IF NOT EXISTS idx_slots_start_time ON slots(start_time);

-- Index on tutor_id for faster tutor-based lookups
CREATE INDEX IF NOT EXISTS idx_slots_tutor_id ON slots(tutor_id);

-- Composite index for common search patterns (tutor_id + status)
CREATE INDEX IF NOT EXISTS idx_slots_tutor_status ON slots(tutor_id, status);

-- Index on username for faster tutor name searches
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Composite index for location searches
CREATE INDEX IF NOT EXISTS idx_slots_location ON slots(location);
