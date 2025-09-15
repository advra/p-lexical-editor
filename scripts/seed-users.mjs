// scripts/seed-users.js
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { SALT_NUMBER } from '../src/lib/constants.mjs';

const outPath = path.join(process.cwd(), 'data', 'users.json');


const rawUsers = [
  { id: 'u1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 'u2', username: 'user', password: 'user123', role: 'operator' },
  { id: 'u3', username: 'viewer', password: 'viewer123', role: 'viewer' },
];

const users = rawUsers.map((u) => {
  const passwordHash = bcrypt.hashSync(u.password, SALT_NUMBER);
  return {
    id: u.id,
    username: u.username,
    passwordHash,
    role: u.role,
  };
});

const dir = path.dirname(outPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(outPath, JSON.stringify(users, null, 2), 'utf8');

console.log(`Wrote ${users.length} users to ${outPath}`);
