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
import z from 'zod';
import { DEFAULT_LIMIT, MAX_LIMIT } from '@/lib/constants.mjs';

// naive slugify helper (keeps a-z0-9- only)
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

// map a Mongo doc -> validated public shape (normalizes _id & dates via zod)
function toPublic(doc: any) {
  return procPublicSchema.parse({
    ...doc,
    _id: doc._id.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

// tiny helper to parse cursor safely
function parseCursor(c?: string) {
  const n = Number(c);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export const procRouter = createTRPCRouter({
  // Create a new proc
  create: protectedProcedure
    .input(procCreateInput)
    .mutation(async ({ ctx, input }) => {
      const owner = ctx.session?.user?.username;
      if (!owner) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const metaIn = input.data?.metadata ?? {};
      const metaTitle = metaIn.title ?? '';
      if (!metaTitle) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'metadata.title is required in data',
        });
      }

      const slug = slugify(input.slug ?? metaTitle);

      // Optional uniqueness check per owner
      if (await ProcModel.exists({ owner, slug })) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Slug already exists for this owner',
        });
      }

      const nowIso = new Date().toISOString();

      // Build final Puck data with server-controlled metadata
      const finalData = {
        ...input.data,
        metadata: {
          ...metaIn,
          title: metaTitle,
          createdBy: owner, // ← set here
          createdAt: metaIn.createdAt ?? nowIso, // ← set if missing
          updatedBy: owner, // optional, for initial write
          updatedAt: nowIso, // optional, for initial write
          version: (metaIn.version ?? 0) + 1, // simple bump
        },
      };

      // TODO: Enable drafts for now this is always set to true for published
      // const nowPublished = !!input.published;
      const nowPublished = true;

      const doc = await ProcModel.create({
        title: metaTitle,
        slug,
        description: input.description,
        tags: input.tags,
        sharedWith: input.sharedWith,
        data: finalData, // ← use finalData
        owner,
        published: nowPublished,
        publishedAt: nowPublished ? new Date() : null,
      });

      const created = await ProcModel.findById(doc._id).lean();
      if (!created)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Create failed',
        });

      return toPublic(created);
    }),

  // Get a proc by id OR (owner, slug) OR (slug)
  getOne: protectedProcedure
    .input(procGetOneInput)
    .query(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      let filter: Record<string, unknown>;
      switch (input.by) {
        case 'id':
          filter = { _id: input.id };
          break;
        case 'ownerSlug':
          filter = { owner: input.owner, slug: input.slug.toLowerCase() };
          break;
        case 'slug':
          // if you intend slug to be globally unique, this is fine; if not, consider scoping by owner
          filter = { slug: input.slug.toLowerCase() };
          break;
      }

      const doc = await ProcModel.findOne(filter).lean();
      if (!doc)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proc not found' });

      const canRead =
        doc.owner === username ||
        doc.sharedWith?.includes(username) ||
        doc.published;
      if (!canRead)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });

      return toPublic(doc);
    }),

  // List my procs (owner = me) with pagination
  listMine: protectedProcedure
    .input(procListMineInput)
    .query(async ({ ctx, input }) => {
      const owner = ctx.session?.user?.username;
      if (!owner) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const limit = input.limit ?? 20;
      const skip = parseCursor(input.cursor);

      const [docs, total] = await Promise.all([
        ProcModel.find({ owner })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ProcModel.countDocuments({ owner }),
      ]);

      return {
        procs: docs.map(toPublic),
        nextCursor: skip + limit < total ? String(skip + limit) : undefined,
        total,
      };
    }),

  // List procs shared with me with pagination (exclude my own)
  listShared: protectedProcedure
    .input(procListSharedInput)
    .query(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const limit = input.limit ?? 20;
      const skip = parseCursor(input.cursor);

      const baseFilter = { sharedWith: username, owner: { $ne: username } };

      const [docs, total] = await Promise.all([
        ProcModel.find(baseFilter)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ProcModel.countDocuments(baseFilter),
      ]);

      return {
        procs: docs.map(toPublic),
        nextCursor: skip + limit < total ? String(skip + limit) : undefined,
        total,
      };
    }),

  // List all accessible (mine + shared + public) with search and pagination
  listAll: protectedProcedure
    .input(procListAllInput)
    .query(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const limit = Math.min(input.limit, MAX_LIMIT) ?? DEFAULT_LIMIT;
      const skip = parseCursor(input.cursor);
      const search = input.query?.trim();

      // base access filter
      const accessible = {
        $or: [
          { owner: username },
          { sharedWith: username },
          { published: true },
        ],
      };

      const query: any = search
        ? {
            $and: [
              accessible,
              {
                $or: [
                  // if your model keeps a root `title`
                  { title: { $regex: search, $options: 'i' } },
                  // also search inside Puck metadata title
                  { 'data.metadata.title': { $regex: search, $options: 'i' } },
                  { description: { $regex: search, $options: 'i' } },
                  // tags array partial match
                  { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
                ],
              },
            ],
          }
        : accessible;

      const [docs, total] = await Promise.all([
        ProcModel.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ProcModel.countDocuments(query),
      ]);

      return {
        procs: docs.map(toPublic),
        nextCursor: skip + limit < total ? String(skip + limit) : undefined,
        total,
      };
    }),

  // Update (only owner)
  update: protectedProcedure
    .input(procUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const owner = ctx.session?.user?.username;
      if (!owner) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const existing = await ProcModel.findById(input.id).lean();
      if (!existing)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proc not found' });
      if (existing.owner !== owner)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owner can update',
        });

      const patch: any = { ...input.patch };

      // keep slug lowercase/safe if present
      if (patch.slug) patch.slug = slugify(patch.slug);

      // if metadata title changes, mirror to root title for search/index
      const newMetaTitle = patch.data?.metadata?.title as string | undefined;
      if (newMetaTitle) patch.title = newMetaTitle;

      // handle publishedAt
      if (typeof patch.published === 'boolean') {
        patch.publishedAt = patch.published ? new Date() : null;
      }

      await ProcModel.updateOne({ _id: input.id }, { $set: patch });

      const updated = await ProcModel.findById(input.id).lean();
      if (!updated)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Update failed',
        });

      return toPublic(updated);
    }),

  // Delete (only owner)
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const owner = ctx.session.user?.username;
      if (!owner) throw new TRPCError({ code: 'UNAUTHORIZED' });

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
