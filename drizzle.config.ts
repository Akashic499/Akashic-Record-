import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './artifacts/server/src/db/schema.ts',
  out: './artifacts/server/src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
});
