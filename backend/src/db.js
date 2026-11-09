const { Pool } = require('pg');

const isTest = process.env.NODE_ENV === 'test';
const connectionString = isTest
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

// Fail fast: a missing URL must never silently fall back to some other database
if (!connectionString) {
  throw new Error(
    `Missing ${isTest ? 'TEST_DATABASE_URL' : 'DATABASE_URL'} environment variable`
  );
}

const pool = new Pool({ connectionString });

module.exports = {
  query: (text, params) => pool.query(text, params),
  close: () => pool.end(),
};