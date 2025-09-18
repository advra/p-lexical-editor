// // src/user/models/user-model.ts

// import mongoose from 'mongoose';

// export interface User {
//   username: string;
//   password: string;
//   avatar?: string; // optional example
// }

// export interface MongoUser extends User, mongoose.Document {}

// export type TUser = User & {
//   _id: string;
//   createdAt: string;
//   updatedAt: string;
// };

// const UserSchema = new mongoose.Schema<User>({
//   username: {
//     type: String,
//     required: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   avatar: {
//     type: String,
//   },
// });

// export default mongoose.models.User || mongoose.model<User>('User', UserSchema);

// src/modules/user/models/user-model.ts
import mongoose, { Schema } from 'mongoose';

export type Role = 'user' | 'admin';

export interface User {
  username: string;
  password: string; // hashed
  avatar?: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

type UserDoc = mongoose.Document & User;

const UserSchema = new Schema<UserDoc>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    // hide password by default
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: { type: String },
    roles: { type: [String], default: ['user'] },
  },
  { timestamps: true },
);

// case-insensitive unique username
UserSchema.index({ username: 1 }, { unique: true });

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDoc>) ||
  mongoose.model<UserDoc>('User', UserSchema);
