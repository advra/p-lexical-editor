import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { PuckPageData } from '@/app/puck/types';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

type CtxParams = { params: { slug: string } };

type PutBody = {
  data: any;
  description?: string;
  tags?: string[];
  published?: boolean;
};

/*
    Get a specific proc by slug
*/
export async function GET(_req: Request, { params }: CtxParams) {
  const caller = appRouter.createCaller(await createTRPCContext());
  const proc = await caller.procs.getOne({ by: 'slug', id: params.slug });
  return NextResponse.json(proc);
}

/*
  Update (publish) an existing proc
*/
export async function PUT(req: Request, { params }: CtxParams) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const { slug } = await params;

    const { data, description, tags, published }: PutBody = await req.json();

    // Build metadata
    const titleFromRoot = (data as any)?.root?.proos?.title as
      | string
      | undefined;
    const metadata = {
      title: titleFromRoot ?? 'Untitled',
      version: (data.metadata?.version ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    const finalData = { ...data, metadata };

    // Upsert by slug
    let existingId: string | null = null;
    try {
      const existing = await caller.procs.getOne({ by: 'slug', slug }); // ✅ by slug
      existingId = existing._id;
    } catch (e) {
      if (!(e instanceof TRPCError && e.code === 'NOT_FOUND')) throw e;
    }

    if (existingId) {
      await caller.procs.update({
        id: existingId,
        patch: {
          slug, // keep consistent
          description: description ?? '',
          tags: tags ?? [],
          data: finalData,
          published: !!published,
        },
      });
    } else {
      await caller.procs.create({
        slug,
        description: description ?? '',
        tags: tags ?? [],
        sharedWith: [],
        data: finalData,
        published: !!published,
      });
    }

    revalidatePath(`/procs/${slug}`);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('PUT /procs/[slug] error:', err);
    return NextResponse.json(
      { status: 'error', message: err?.message ?? 'Internal error' },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: CtxParams) {
  const caller = appRouter.createCaller(await createTRPCContext());
  await caller.procs.delete({ id: params.slug });
  return NextResponse.json({ ok: true });
}
