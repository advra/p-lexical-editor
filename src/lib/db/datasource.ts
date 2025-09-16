/* /src/lib/db/datasource.ts

  Database Util for connecting to either stubbed json database (from data/*.json) or pointed to a mongodb
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import { MongoClient } from 'mongodb';
import { z } from 'zod';
import { env } from 'node:process';
import { Payload } from '@/app/puck/types';

const EnvConfigs = z.object({
  DATA_SOURCE: z.enum(['local-json', 'mongodb']),
  DB_JSON_PATH: z.string().optional(),
  USERS_JSON_PATH: z.string().optional(),
  DATABASE_URL: z.string().optional(),
})

const envConfig = EnvConfigs.parse({
  DATA_SOURCE: process.env.DATA_SOURCE,
  DB_JSON_PATH: process.env.DB_JSON_PATH,
  USERS_JSON_PATH: process.env.USERS_JSON_PATH,
  DATABASE_URL: process.env.DATABASE_URL,
});

// User type from the database which stores password hashes
type UserInternal = {
  id: string;
  username: string;
  passwordHash: string;
}

async function loadJson<T>(p: string | undefined): Promise<T> {
  if (!p) throw new Error("Missing JSON path env");
  const file = path.resolve(process.cwd(), p)

  return JSON.parse(await fs.readFile(file, 'utf8')) as T
}

// local json implementation
async function fromJson() {
  const procs = await loadJson<Payload>(env.DB_JSON_PATH);
  const users = await loadJson<UserInternal[]>(env.USERS_JSON_PATH);

  return {
    getProcs: procs.data,
    getUserByUsername: async (username: string) => users.find(u => u.username === username) ?? null
  }
}

// mongo implementation
let mongoClient: MongoClient | null = null;
async function getMongo() {
  if (!env.DATABASE_URL) throw new Error("Missing DATABASE_URL");
  try {
    mongoClient = new MongoClient(env.DATABASE_URL);
    await mongoClient?.connect();
  } catch (e) {
    throw new Error('DB_CONNECT_FAILED', { cause: e instanceof Error ? e : undefined })
  }

  const db = mongoClient.db();

  return {
    getProcs: async () => {
      try {
        return (await db.collection<Payload>('procs').find({})).toArray();
      } catch (e) {
        throw new Error('DB_QUERY_FAILED:getUserByUsername', { cause: e instanceof Error ? e : undefined })
      }
    },

    getUserByUsername: async (username: string) => {
      try {
        return (await db.collection<UserInternal>('users').findOne({
          username
        })) ?? null;
      } catch (e) {
        throw new Error('DB_QUERY_FAILED:getUserByUsername', { cause: e instanceof Error ? e : undefined })
      }
    }
  }
}

export async function getDataSources() {
  console.log(`Connected to ${env.DATA_SOURCE}`)
  return env.DATA_SOURCE === 'local-json' ? fromJson() : getMongo()
}
