import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from '@/trpc/init';
import {
  ProcSessionModel,
  toPublic,
} from '../models/proc-session-model';
import { createSessionInput, deleteSessionInput, getSessionInput, stopSessionInput, updateSessionInput, updateSessionRecordInput } from './types';

export const procSessionsRouter = createTRPCRouter({
  // Get sessions by ID or user's active sessions for a proc
  getSessions: protectedProcedure
    .input(getSessionInput)
    .query(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const { procId, sessionId } = input;

      if (!procId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'procId is required',
        });
      }

      let query: any = { procId };

      if (sessionId) {
        query._id = sessionId;
      } else {
        // If no sessionId provided, get user's active sessions for this proc
        query.createdBy = username;
        query.status = 'active';
      }

      const sessions = await ProcSessionModel.find(query).sort({
        createdAt: -1,
      });

      return {
        sessions: sessions.map((session) => toPublic(session)),
      };
    }),

  // Create a new session (always creates a new unique session)
  createSession: protectedProcedure
    .input(createSessionInput)
    .mutation(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const { procId } = input;

      if (!procId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'procId is required',
        });
      }

      // Always create a new session with unique timestamp
      const timestamp = new Date().getTime();
      const procSession = await ProcSessionModel.create({
        procId,
        name: `session-${username}-${timestamp}`,
        createdBy: username,
        status: 'active',
        updatedAt: new Date(),
        records: [],
      });

      return {
        session: toPublic(procSession),
      };
    }),

  // Update session or add/update records
  stopSession: protectedProcedure
    .input(stopSessionInput)
    .mutation(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const { sessionId} = input;

      if (!sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'sessionId is required',
        });
      }

      // Get the session first to get procId for socket room
      const existingSession = await ProcSessionModel.findById(sessionId);
      if (!existingSession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      let updateData: any = {};

      updateData.$set = {
        ...updateData.$set,
        status: 'completed',
        updatedAt: new Date(),
      };

      // If no update data was set, return error
      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No valid update data provided',
        });
      }

      const updatedSession = await ProcSessionModel.findByIdAndUpdate(
        sessionId,
        updateData,
        { new: true },
      );

      if (!updatedSession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      // Emit socket event to notify all users in the session room
      try {
        const { sessionSocketService } = await import('@/services/socket/session-socket');
        sessionSocketService.emitSessionStatusChanged({
          room: sessionId,  // Use sessionId as room for targeted notifications
          sessionId: sessionId,
          status: 'completed',
          changedBy: username,
        });
      } catch (error) {
        console.error('Failed to emit session status change:', error);
        // Don't fail the mutation if socket emission fails
      }

      return {
        session: toPublic(updatedSession),
      };
    }),

  // Update session or add/update records
  updateSession: protectedProcedure
    .input(updateSessionInput)
    .mutation(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const { sessionId, recordId, state, blockType, data, status } = input;

      if (!sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'sessionId is required',
        });
      }

      let updateData: any = {};

      // If updating a record within the session
      if (recordId && state) {
        const recordUpdate = {
          recordId,
          blockType: blockType || 'TaskItem', // Default to TaskItem if not specified
          state,
          updatedBy: username,
          updatedAt: new Date(),
          data: data || {}, // Include any additional data
        };

        // Find if record already exists in session
        const procSession = await ProcSessionModel.findById(sessionId);
        if (!procSession) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Session not found',
          });
        }

        const existingRecordIndex = procSession.records.findIndex(
          (r) => r.recordId === recordId,
        );

        if (existingRecordIndex >= 0) {
          // Update existing record
          updateData.$set = {
            [`records.${existingRecordIndex}`]: recordUpdate,
          };
        } else {
          // Add new record
          updateData.$push = {
            records: recordUpdate,
          };
        }
      }

      // If updating session status
      if (status) {
        updateData.$set = {
          ...updateData.$set,
          status,
          updatedAt: new Date(),
        };
      }

      // If no update data was set, return error
      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No valid update data provided',
        });
      }

      const updatedSession = await ProcSessionModel.findByIdAndUpdate(
        sessionId,
        updateData,
        { new: true },
      );

      if (!updatedSession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      return {
        session: toPublic(updatedSession),
      };
    }),

  // Update session record with socket emission
  updateSessionRecord: protectedProcedure
    .input(updateSessionRecordInput)
    .mutation(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const { sessionId, recordId, state, blockType, data } = input;

      if (!sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'sessionId is required',
        });
      }

      if (!recordId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'recordId is required',
        });
      }

      const recordUpdate = {
        recordId,
        blockType: blockType || 'TaskItem',
        state,
        updatedBy: username,
        updatedAt: new Date(),
        data: data || {},
      };

      // Find if record already exists in session
      const procSession = await ProcSessionModel.findById(sessionId);
      if (!procSession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      const existingRecordIndex = procSession.records.findIndex(
        (r) => r.recordId === recordId,
      );

      let updateData: any = {};
      if (existingRecordIndex >= 0) {
        // Update existing record
        updateData.$set = {
          [`records.${existingRecordIndex}`]: recordUpdate,
        };
      } else {
        // Add new record
        updateData.$push = {
          records: recordUpdate,
        };
      }

      const updatedSession = await ProcSessionModel.findByIdAndUpdate(
        sessionId,
        updateData,
        { new: true },
      );

      if (!updatedSession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      // Emit socket event to notify all users in the session room
      try {
        const { sessionSocketService } = await import('@/services/socket/session-socket');
        sessionSocketService.emitRecordUpdated({
          room: sessionId,  // Use sessionId as room for targeted notifications
          sessionId: sessionId,
          recordId: recordId,
          state: state,
          updatedBy: username,
        });
      } catch (error) {
        console.error('Failed to emit record update:', error);
        // Don't fail the mutation if socket emission fails
      }

      return {
        session: toPublic(updatedSession),
      };
    }),

  // Delete a session
  deleteSession: protectedProcedure
    .input(deleteSessionInput)
    .mutation(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const { sessionId } = input;

      if (!sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'sessionId is required',
        });
      }

      const deletedSession =
        await ProcSessionModel.findByIdAndDelete(sessionId);

      if (!deletedSession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      return { success: true };
    }),
});
