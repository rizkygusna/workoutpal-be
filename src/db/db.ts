import { createClient } from '@libsql/client';
import 'dotenv/config';

export const client = createClient({
  url: process.env.DATABASE_REPLICA!,
  syncUrl: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
