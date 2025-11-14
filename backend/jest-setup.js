process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = './test.db';

const { setupTestDatabase, cleanupTestDatabase } = require('./tests/setup');

// Global setup
beforeAll(async () => {
  await cleanupTestDatabase();
  await setupTestDatabase();
});

// Global teardown
afterAll(async () => {
  await cleanupTestDatabase();
});
