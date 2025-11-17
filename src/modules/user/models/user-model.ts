// src/modules/user/models/user-model.ts
import mongoose, { Schema } from 'mongoose';

// role for overall app user, admin or super-admin
export type Role = 'user' | 'admin' | 'super-admin';

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
