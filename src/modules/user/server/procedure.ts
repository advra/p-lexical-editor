// src/modules/user/server/procedure.ts
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { UserModel } from '../models/user-model';
import {
  userCreateSchema,
  userGetOneInput,
  userPublicSchema,
  userSignInInput as usersLoginInput,
} from './schemas';

export const usersRouter = createTRPCRouter({
  // create (register)
  create: baseProcedure.input(userCreateSchema).mutation(async ({ input }) => {
    const exists = await UserModel.findOne({ username: input.username }).lean();
    if (exists) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Username already taken',
      });
    }
    const hashed = await bcrypt.hash(input.password, 12);
    const doc = await UserModel.create({
      username: input.username,
      password: hashed,
      avatar: input.avatar,
      roles: input.roles ?? ['user'],
    });
    // re-fetch lean without password
    const created = await UserModel.findById(doc._id).lean();
    return userPublicSchema.parse({
      ...created,
      _id: created!._id.toString(),
    });
  }),

  // get one (public view)
  getOne: baseProcedure.input(userGetOneInput).query(async ({ input }) => {
    const user = await UserModel.findOne({ username: input.username }).lean();
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }
    return userPublicSchema.parse({
      ...user,
      _id: user._id.toString(),
    });
  }),

  // sign in (server-side auth check)
  login: baseProcedure.input(usersLoginInput).mutation(async ({ input }) => {
    const user = await UserModel.findOne({ username: input.username })
      .select('+password') // include password just for compare
      .lean();

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }
    const ok = await bcrypt.compare(input.password, user.password as string);
    if (!ok) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    // return a safe public user for session payloads
    return userPublicSchema.parse({
      ...user,
      _id: user._id.toString(),
    });
  }),
});
