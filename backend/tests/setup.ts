import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables before any test or module runs.
// This must point to .env.test so tests use the isolated test database,
// never the development database.
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
