// db/mongoose.ts

import mongoose from 'mongoose';
declare global {
  var mongoose: any;
}

if (!process.env.MONGODB_URL) {
  throw new Error(
    'Please define the MONGODB_URL environment variable inside .env.local',
  );
}
console.log('MONGODB_URL IS: ', process.env.MONGODB_URL);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!process.env.MONGODB_URL) {
    throw new Error(
      'Please define the MONGODB_URL environment variable inside .env.local',
    );
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose
      .connect(process.env.MONGODB_URL, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
