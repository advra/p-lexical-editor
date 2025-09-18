// scripts/seed-users.js

/*
  This script is used to generated the pre-made users with salted passwords.
  Generated users are stored in data/users.json
  
  These then will be used by the docker/init-user.sh to seed Users into the database
*/

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { SALT_NUMBER } from '../src/lib/constants.mjs';

const outPath = path.join(process.cwd(), 'docker', 'users.json');

const rawUsers = [
  { id: 'u1', username: 'admin', password: 'Admin123!', roles: 'admin' },
  { id: 'u2', username: 'user', password: 'User123!', roles: 'operator' },
  { id: 'u3', username: 'viewer', password: 'Viewer123!', roles: 'viewer' },
];

const users = rawUsers.map((u) => {
  const passwordHash = bcrypt.hashSync(u.password, SALT_NUMBER);
  return {
    id: u.id,
    username: u.username,
    passwordHash,
    roles: u.roles,
  };
});

const dir = path.dirname(outPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(outPath, JSON.stringify(users, null, 2), 'utf8');

console.log(`Wrote ${users.length} users to ${outPath}`);
