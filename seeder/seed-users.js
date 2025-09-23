import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// databae to connect to for import
const DEFAULT_URI =
  'mongodb://r00t:r00t@localhost:27017/eproc?authSource=admin';
// salt the passwords in database
const DEFAULT_SALT = 10;

// load the correct env file
// e.g. NODE_ENV=development loads .env.development
dotenv.config({
  path: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`,
});

const MONGODB_URL = process.env.MONGODB_URL?.trim() || DEFAULT_URI;
const SALT_NUMBER =
  Number(process.env.SALT_NUMBER ?? DEFAULT_SALT) || DEFAULT_SALT;

if (!MONGODB_URL) {
  throw new Error('Missing MONGODB_URL and no fallback provided');
}

const rawUsers = [
  { username: 'admin', password: 'Admin123!', roles: ['admin'] },
  { username: 'user', password: 'User123!', roles: ['operator'] },
  { username: 'viewer', password: 'Viewer123!', roles: ['viewer'] },
];

async function seed() {
  const client = new MongoClient(MONGODB_URL);
  try {
    await client.connect();
    const db = client.db(); // will use the database specified in the URI (eproc)
    const users = db.collection('users');

    // Explicitly create an empty 'procs' collection
    await db.createCollection('procs');
    console.log('Collection "procs" created.');

    // create a unique index on username
    await users.createIndex({ username: 1 }, { unique: true });

    for (const u of rawUsers) {
      const password = await bcrypt.hash(u.password, SALT_NUMBER);
      await users.updateOne(
        { username: u.username },
        {
          $setOnInsert: { createdAt: new Date() },
          $set: {
            roles: u.roles,
            password: password,
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );
      console.log('Seeded/updated', u.username);
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seed();
