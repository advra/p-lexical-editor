import { TRPCError } from '@trpc/server';
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from '@/trpc/init';
import { ProcModel } from '../models/proc-model';
import {
  procCreateInput,
  procGetOneInput,
  procListMineInput,
  procListSharedInput,
  procListAllInput,
  procPublicSchema,
  procUpdateInput,
} from './schemas';

// naive slugify helper (keeps a-z0-9- only)
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export const procRouter = createTRPCRouter({
  // Create a new proc
  create: protectedProcedure
    .input(procCreateInput)
    .mutation(async ({ ctx, input }) => {
      const owner = ctx.session?.user?.username;
      const slug = input.slug ?? slugify(input.title);

      // Create
      const doc = await ProcModel.create({
        title: input.title,
        slug,
        description: input.description,
        tags: input.tags,
        sharedWith: input.sharedWith,
        data: input.data,
        published: !!input.published,
        publishedAt: input.published ? new Date() : null,
        owner,
      });

      const created = await ProcModel.findById(doc._id).lean();
      return procPublicSchema.parse({
        ...created,
        _id: created!._id.toString(),
        createdAt: created!.createdAt,
        updatedAt: created!.updatedAt,
      });
    }),

  // Get a proc by id OR (owner, slug)
  getOne: protectedProcedure
    .input(procGetOneInput)
    .query(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      const filter =
        'id' in input
          ? { _id: input.id }
          : { owner: input.owner, slug: input.slug.toLowerCase() };

      const doc = await ProcModel.findOne(filter).lean();
      if (!doc)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proc not found' });

      // Access control: owner or sharedWith includes the requesting user
      const canRead =
        doc.owner === username ||
        doc.sharedWith?.includes(username) ||
        doc.published;
      if (!canRead)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });

      return procPublicSchema.parse({
        ...doc,
        _id: doc._id.toString(),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      });
    }),

  // List my procs (owner = me) with pagination
  listMine: protectedProcedure
    .input(procListMineInput)
    .query(async ({ ctx, input }) => {
      const owner = ctx.session?.user?.username;
      const limit = input.limit ?? 20;
      const skip = input.cursor ? parseInt(input.cursor) : 0;

      const docs = await ProcModel.find({ owner })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ProcModel.countDocuments({ owner });

      return {
        procs: docs.map((d) =>
          procPublicSchema.parse({
            ...d,
            _id: d._id.toString(),
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          }),
        ),
        nextCursor:
          skip + limit < total ? (skip + limit).toString() : undefined,
        total,
      };
    }),

  // List procs shared with me with pagination
  listShared: protectedProcedure
    .input(procListSharedInput)
    .query(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      const limit = input.limit ?? 20;
      const skip = input.cursor ? parseInt(input.cursor) : 0;

      const docs = await ProcModel.find({
        sharedWith: username,
        owner: { $ne: username }, // Exclude own procs
      })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ProcModel.countDocuments({
        sharedWith: username,
        owner: { $ne: username },
      });

      return {
        procs: docs.map((d) =>
          procPublicSchema.parse({
            ...d,
            _id: d._id.toString(),
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          }),
        ),
        nextCursor:
          skip + limit < total ? (skip + limit).toString() : undefined,
        total,
      };
    }),

  // List all procs (mine + shared + public) with search and pagination
  listAll: protectedProcedure
    .input(procListAllInput)
    .query(async ({ ctx, input }) => {
      // const username = requireUsername(ctx);
      const limit = input.limit ?? 20;
      const skip = input.cursor ? parseInt(input.cursor) : 0;
      const searchQuery = input.query?.trim().toLowerCase();

      // Build the query for accessible procs
      const accessibleQuery = {
        $or: [
          { owner: ctx.session?.user?.username }, // My procs
          { sharedWith: ctx.session?.user?.username }, // Shared with me
          { published: true }, // Public procs
        ],
      };

      let query: any = accessibleQuery;

      // Add search filter if provided
      if (searchQuery) {
        query = {
          $and: [
            accessibleQuery,
            {
              $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { tags: { $in: [searchQuery] } },
              ],
            },
          ],
        };
      }

      const docs = await ProcModel.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ProcModel.countDocuments(query);

      return {
        procs: docs.map((d) =>
          procPublicSchema.parse({
            ...d,
            _id: d._id.toString(),
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          }),
        ),
        nextCursor:
          skip + limit < total ? (skip + limit).toString() : undefined,
        total,
      };
    }),

  // Update (only owner)
  update: protectedProcedure
    .input(procUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const owner = ctx.session?.user?.username;

      const existing = await ProcModel.findById(input.id).lean();
      if (!existing)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proc not found' });
      if (existing.owner !== owner)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owner can update',
        });

      const patch = { ...input.patch } as any;

      // keep slug lowercase and safe
      if (patch.slug) patch.slug = patch.slug.toLowerCase();

      // handle publishedAt
      if (typeof patch.published === 'boolean') {
        patch.publishedAt = patch.published ? new Date() : null;
      }

      await ProcModel.updateOne({ _id: input.id }, { $set: patch });

      const updated = await ProcModel.findById(input.id).lean();
      return procPublicSchema.parse({
        ...updated,
        _id: updated!._id.toString(),
        createdAt: updated!.createdAt,
        updatedAt: updated!.updatedAt,
      });
    }),

  // Delete (only owner)
  delete: protectedProcedure
    .input(
      // simple input schema inline—could move to schemas.ts
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      (await import('zod')).default.object({
        id: (await import('zod')).default.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const owner = ctx.session.user?.username;
      const doc = await ProcModel.findById(input.id).lean();
      if (!doc)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proc not found' });
      if (doc.owner !== owner)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owner can delete',
        });

      await ProcModel.deleteOne({ _id: input.id });
      return { ok: true };
    }),
});
