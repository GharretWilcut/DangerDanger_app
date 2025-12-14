import { config } from 'dotenv';
config({ path: '.env.test' });

// Optional sanity check (remove later)
console.log('TEST DATABASE_URL:', process.env.DATABASE_URL);
