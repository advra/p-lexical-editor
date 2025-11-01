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
  redlineGetByRedlineInput,
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

      if (!procRedlines || !procRedlines.blocks) {
        return [];
      }

      let allRedlines: any[] = [];

      // Convert blocks map to array of redlines
      procRedlines.blocks.forEach((block) => {
        if (block.redlines) {
          block.redlines.forEach((redline) => {
            allRedlines.push(redline);
          });
        }
      });

      // Filter by status if provided
      if (input.status) {
        allRedlines = allRedlines.filter((r) => r.status === input.status);
      }

      // Sort by creation date (newest first)
      allRedlines.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return allRedlines;
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

      if (!procRedlines || !procRedlines.blocks) {
        return [];
      }

      let allRedlines: any[] = [];

      // Convert blocks map to array of redlines
      procRedlines.blocks.forEach((block) => {
        if (block.redlines) {
          block.redlines.forEach((redline) => {
            allRedlines.push(redline);
          });
        }
      });

      // Filter by blockId if provided
      if (input.blockId) {
        allRedlines = allRedlines.filter((r) => r.blockId === input.blockId);
      }

      // Sort by creation date (newest first)
      allRedlines.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return allRedlines;
    }),

  getByRedlineId: protectedProcedure
    .input(redlineGetByRedlineInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // Find the proc redlines document
      const procRedlines = await ProcRedlinesModel.findOne({
        procId: input.procId,
      });

      if (!procRedlines || !procRedlines.blocks) {
        return null;
      }

      // Find the specific redline by ID - iterate through the Map
      for (const [blockId, blockData] of procRedlines.blocks) {
        if (blockData.redlines) {
          for (const [target, redline] of blockData.redlines) {
            if (redline.dcn === input.redlineId) {
              return redline;
            }
          }
        }
      }

      return null;
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
