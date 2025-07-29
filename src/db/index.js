import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

await db.connect();

export default db;
