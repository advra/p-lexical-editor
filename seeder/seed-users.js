import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
// import dotenv from "dotenv";

// dotenv.config();

// const uri = "mongodb://r00t:r00t@mongo:27017/eproc?authSource=admin";
const uri = "mongodb://r00t:r00t@mongo:27017/eproc?authSource=admin";
// const SALT_NUMBER = parseInt(process.env.SALT_NUMBER || "10", 10);
const SALT_NUMBER = 10;

const rawUsers = [
  { username: "admin", password: "Admin123!", roles: "admin" },
  { username: "user", password: "User123!", roles: "operator" },
  { username: "viewer", password: "Viewer123!", roles: "viewer" },
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // will use the database specified in the URI (eproc)
    const users = db.collection("users");

    // Explicitly create an empty 'procs' collection
    await db.createCollection('procs');
    console.log('Collection "procs" created.');

    // create a unique index on username
    await users.createIndex({ username: 1 }, { unique: true });

    for (const u of rawUsers) {
      const passwordHashed = await bcrypt.hash(u.password, SALT_NUMBER);
      await users.updateOne(
        { username: u.username },
        {
          $setOnInsert: { createdAt: new Date() },
          $set: {
            roles: u.roles,
            password: passwordHashed,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log("Seeded/updated", u.username);
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seed();
