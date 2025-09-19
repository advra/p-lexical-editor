import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { PuckPageData } from '@/app/puck/types';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

type CreateRequestProps = {
  path: string; // e.g. /procs/{uuid}
  data: PuckPageData; // must include data.metadata
};

export async function POST(request: Request) {
  try {
    const createProcRequest: CreateRequestProps = await request.json();
    const caller = appRouter.createCaller(await createTRPCContext());

    const { path, data } = createProcRequest;
    const slug = path.split('/').filter(Boolean).pop()!; // last segment

    // Ensure metadata.title is present (fallback to root.title if your builder put it there)
    const titleFromRoot = (data as any)?.root?.title as string | undefined;
    const metadata = {
      ...data.metadata,
      title: data.metadata?.title ?? titleFromRoot ?? 'New',
      // optional: bump version / set updatedAt here if you want
      version: (data.metadata?.version ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    const finalData: PuckPageData = { ...data, metadata };

    // Try get existing by slug (your router supports { by: 'slug', slug })
    let existingId: string | null = null;
    try {
      const existing = await caller.procs.getOne({ by: 'slug', slug });
      existingId = existing._id;
    } catch (e) {
      if (!(e instanceof TRPCError && e.code === 'NOT_FOUND')) {
        throw e; // rethrow unexpected errors
      }
    }

    if (existingId) {
      // UPDATE path
      await caller.procs.update({
        id: existingId,
        patch: {
          slug, // keep slug consistent
          description: (data as any)?.root?.description,
          tags: (data as any)?.root?.tags ?? [],
          data: finalData,
          published: true,
        },
      });
    } else {
      // CREATE path
      await caller.procs.create({
        slug,
        description: (data as any)?.root?.description,
        tags: (data as any)?.root?.tags ?? [],
        sharedWith: [],
        data: finalData,
        published: true,
      });
    }

    // Purge Next.js cache for this page
    revalidatePath(path);
    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Publish error:', err);
    const message =
      err?.message ?? (typeof err === 'string' ? err : 'Internal error');
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
