import { TRPCError } from '@trpc/server';
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from '@/trpc/init';
import { ProcRedlinesModel, toPublic } from '../models/redline-model';
import {
  redlineCreateInput,
  redlineUpdateInput,
  redlineGetByProcInput,
  redlineGetByBlockInput,
  redlineDeleteInput,
} from './schemas';

// TODO: Update TRPC procedures to work with new redline data model structure
// The redline data model has been restructured to organize redlines by procId
// with an array of redline items. These procedures need to be updated accordingly.

export const redlineRouter = createTRPCRouter({
  // TODO: Update create procedure for new data model
  create: protectedProcedure
    .input(redlineCreateInput)
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message:
          'Redline create procedure needs to be updated for new data model',
      });
    }),

  // TODO: Update update procedure for new data model
  update: protectedProcedure
    .input(redlineUpdateInput)
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message:
          'Redline update procedure needs to be updated for new data model',
      });
    }),

  // TODO: Update getByProc procedure for new data model
  getByProc: protectedProcedure
    .input(redlineGetByProcInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // Find the proc redlines document
      const procRedlines = await ProcRedlinesModel.findOne({
        procId: input.procId,
      });

      if (!procRedlines) {
        return [];
      }

      let redlines = procRedlines.redlines;

      // Filter by status if provided
      if (input.status) {
        redlines = redlines.filter((r) => r.status === input.status);
      }

      // Sort by creation date (newest first)
      redlines.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return redlines;
    }),

  // TODO: Update getByBlock procedure for new data model
  getByBlock: protectedProcedure
    .input(redlineGetByBlockInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // Find the proc redlines document
      const procRedlines = await ProcRedlinesModel.findOne({
        procId: input.procId,
      });

      if (!procRedlines) {
        return [];
      }

      // Filter redlines by blockId
      const blockRedlines = procRedlines.redlines.filter(
        (r) => r.blockId === input.blockId,
      );

      // Sort by creation date (newest first)
      blockRedlines.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return blockRedlines;
    }),

  // TODO: Update delete procedure for new data model
  delete: protectedProcedure
    .input(redlineDeleteInput)
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message:
          'Redline delete procedure needs to be updated for new data model',
      });
    }),
});
