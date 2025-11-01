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
  redlineGetByRedlineInput,
} from './schemas';

export const redlineRouter = createTRPCRouter({
  create: protectedProcedure
    .input(redlineCreateInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // Generate unique redlineId
      const redlineId = `${input.procId}_${input.blockId}_${input.dcn}_${Date.now()}`;
      
      const redline = await RedlineModel.create({
        procId: input.procId,
        blockId: input.blockId,
        dcn: input.dcn,
        redlineId,
        target: 'content', // Default target, can be made configurable
        originalText: input.originalText,
        newText: input.newText,
        userId,
        status: 'pending',
        comments: [],
      });

      return toPublic(redline);
    }),

  update: protectedProcedure
    .input(redlineUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const redline = await RedlineModel.findById(input.id);
      if (!redline) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Redline not found' });
      }

      // Update the redline
      const updatedRedline = await RedlineModel.findByIdAndUpdate(
        input.id,
        { $set: input.patch },
        { new: true }
      );

      return toPublic(updatedRedline);
    }),

  getByProc: protectedProcedure
    .input(redlineGetByProcInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const query: any = { procId: input.procId };
      if (input.status) {
        query.status = input.status;
      }

      const redlines = await RedlineModel.find(query)
        .sort({ createdAt: -1 })
        .exec();

      return redlines.map(toPublic);
    }),

  getByBlock: protectedProcedure
    .input(redlineGetByBlockInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const redlines = await RedlineModel.find({
        procId: input.procId,
        blockId: input.blockId,
      })
        .sort({ createdAt: -1 })
        .exec();

      return redlines.map(toPublic);
    }),

  getByRedlineId: protectedProcedure
    .input(redlineGetByRedlineInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // unique DCN per comment?
      let redline = await RedlineModel.findOne({
        dcn: input.redlineId
      })

      console.log('FOUND:', redline);

      return redline ? toPublic(redline) : null;
    }),

  delete: protectedProcedure
    .input(redlineDeleteInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.username;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const redline = await RedlineModel.findById(input.id);
      if (!redline) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Redline not found' });
      }

      await RedlineModel.findByIdAndDelete(input.id);
      return { success: true };
    }),
});
