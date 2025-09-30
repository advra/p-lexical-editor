import { TRPCError } from '@trpc/server';
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from '@/trpc/init';
import { ProcModel, toPublic } from '../models/proc-model';
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
import { uniqueSlugForTitle } from '../utils/title-generator';

// naive slugify helper (keeps a-z0-9- only)
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
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

      const title = input.title;
      if (!title)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'title is required',
        });

      const slug = await uniqueSlugForTitle(title, ProcModel);
      // TODO: Enable drafts for now this is always set to true for published
      // const publishNow = !!input.publishNow;
      const publishNow = true;
      const now = new Date();

      const doc = await ProcModel.create({
        slug,
        owner,
        status: publishNow ? 'published' : 'draft',
        publishedAt: publishNow ? now : null,
        version: 1,

        title,
        description: input.description,
        tags: input.tags ?? [],
        sharedWith: input.sharedWith ?? [],

        data: {
          ...input.data,
          // keep editor metadata in sync
          metadata: { ...(input.data.metadata ?? {}), title },
        },
      });

      return toPublic(doc.toObject(), { includeACL: true });
    }),

  // Get a proc by id OR (owner, slug) OR (slug)
  getOne: protectedProcedure
    .input(procGetOneInput)
    .query(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      let filter: Record<string, unknown> = {};
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
        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid filter type',
          });
      }

      const doc = await ProcModel.findOne(filter).lean();
      if (!doc)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proc not found' });

      const isOwner = doc.owner === username;
      const isSharedUser = (doc.sharedWith ?? []).some(
        (s: any) =>
          s.userId === username &&
          (s.permission === 'read' || s.permission === 'edit'),
      );
      const canRead = doc.status === 'published' || isOwner || isSharedUser;
      if (!canRead)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });

      return toPublic(doc, { includeACL: isOwner || isSharedUser });
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
        // owner always sees ACL
        procs: docs.map((doc) => toPublic(doc, { includeACL: true })),
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

      const baseFilter = {
        'sharedWith.userId': username,
        owner: { $ne: username },
      };

      const [docs, total] = await Promise.all([
        ProcModel.find(baseFilter)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ProcModel.countDocuments(baseFilter),
      ]);

      return {
        // shared users always see ACL
        procs: docs.map((doc) => toPublic(doc, { includeACL: true })),
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

      // base access filter - fix sharedWith query to match the schema
      const accessible = {
        $or: [
          { owner: username },
          { 'sharedWith.userId': username },
          { status: 'published' },
        ],
      } as const;

      if (accessible) {
        console.log('HAS ACCESS');
      }

      const query: any = search
        ? {
            $and: [
              accessible,
              {
                $or: [
                  { title: { $regex: search, $options: 'i' } },
                  { description: { $regex: search, $options: 'i' } },
                  { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
                  { 'data.title': { $regex: search, $options: 'i' } }, // optional
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
        // provide doc with ACL if user is owner or sharedWith
        procs: docs.map((d) => {
          const isOwner = d.owner === username;
          const isSharedUser = (d.sharedWith ?? []).some(
            (s: any) =>
              s.userId === username &&
              (s.permission === 'read' || s.permission === 'edit'),
          );
          return toPublic(d, { includeACL: isOwner || isSharedUser });
        }),
        nextCursor: skip + limit < total ? String(skip + limit) : undefined,
        total,
      };
    }),

  // Update (owner or shared users with edit permission)
  update: protectedProcedure
    .input(procUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const username = ctx.session?.user?.username;
      if (!username) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const existing = await ProcModel.findById(input.id).lean();
      if (!existing)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proc not found' });

      const isOwner = existing.owner === username;
      const isSharedWithEdit = (existing.sharedWith ?? []).some(
        (s: any) => s.userId === username && s.permission === 'edit',
      );

      if (!isOwner && !isSharedWithEdit)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owner or users with edit permission can update',
        });

      const patch: any = { ...input.patch };

      if (patch.slug) patch.slug = slugify(patch.slug);

      // mirror editor title to root
      const newMetaTitle = patch.data?.metadata?.title as string | undefined;
      if (newMetaTitle && !patch.title) patch.title = newMetaTitle;

      // publishedAt logic
      if (patch.status) {
        if (patch.status === 'published') {
          patch.publishedAt = new Date();
        } else {
          patch.publishedAt = null;
        }
      }

      await ProcModel.updateOne({ _id: input.id }, { $set: patch });

      const updated = await ProcModel.findById(input.id).lean();
      if (!updated)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Update failed',
        });

      return procPublicSchema.parse({
        ...updated,
        _id: String(updated._id),
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        publishedAt: updated.publishedAt,
      });
    }),

  // Delete (only owner)
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const owner = ctx.session?.user?.username;
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
