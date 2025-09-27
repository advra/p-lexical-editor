import { TRPCError } from '@trpc/server';
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from '@/trpc/init';
import { RedlineModel, toPublic } from '../models/redline-model';
import {
  redlineCreateInput,
  redlineUpdateInput,
  redlineGetByProcInput,
  redlineGetByBlockInput,
  redlineDeleteInput,
} from './schemas';

export const redlineRouter = createTRPCRouter({
  // Create a new redline
  create: protectedProcedure
    .input(redlineCreateInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const doc = await RedlineModel.create({
        ...input,
        userId,
        status: 'pending',
      });

      return toPublic(doc.toObject());
    }),

  // Update a redline (status, description, etc.)
  update: protectedProcedure
    .input(redlineUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const existing = await RedlineModel.findById(input.id);
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Redline not found',
        });
      }

      // Only allow the original creator to update their redline
      if (existing.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the creator can update this redline',
        });
      }

      await RedlineModel.updateOne({ _id: input.id }, { $set: input.patch });

      const updated = await RedlineModel.findById(input.id);
      if (!updated) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Update failed',
        });
      }

      return toPublic(updated.toObject());
    }),

  // Get redlines by proc ID
  getByProc: protectedProcedure
    .input(redlineGetByProcInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const filter: any = { procId: input.procId };
      if (input.status) {
        filter.status = input.status;
      }

      const docs = await RedlineModel.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      return docs.map((doc) => toPublic(doc));
    }),

  // Get redlines by block ID
  getByBlock: protectedProcedure
    .input(redlineGetByBlockInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const docs = await RedlineModel.find({
        procId: input.procId,
        blockId: input.blockId,
      })
        .sort({ createdAt: -1 })
        .lean();

      return docs.map((doc) => toPublic(doc));
    }),

  // Delete a redline
  delete: protectedProcedure
    .input(redlineDeleteInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const existing = await RedlineModel.findById(input.id);
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Redline not found',
        });
      }

      // Only allow the original creator to delete their redline
      if (existing.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the creator can delete this redline',
        });
      }

      await RedlineModel.deleteOne({ _id: input.id });
      return { ok: true };
    }),
});
