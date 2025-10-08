import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { PuckPageData } from '@/app/puck/types';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

type PutBody = {
  data: any;
  description?: string;
  tags?: string[];
  published?: boolean;
};

/*
    Get a specific proc by slug
*/
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const caller = appRouter.createCaller(await createTRPCContext());
  const proc = await caller.procs.getOne({ by: 'slug', slug });
  return NextResponse.json(proc);
}

/*
  Update (publish) an existing proc
*/
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const { slug } = await params;

    const { data, description, tags, published }: PutBody = await req.json();

    // Build metadata
    const titleFromRoot = (data as any)?.root?.props?.title as
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
      const existing = await caller.procs.getOne({ by: 'slug', slug });
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
        },
      });
    } else {
      await caller.procs.create({
        title: titleFromRoot ?? 'Untitled',
        description: description ?? '',
        tags: tags ?? [],
        sharedWith: [],
        data: finalData,
        publishNow: !!published,
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const caller = appRouter.createCaller(await createTRPCContext());

  // First get the proc to get its ID
  const proc = await caller.procs.getOne({ by: 'slug', slug });
  await caller.procs.delete({ id: proc._id });

  return NextResponse.json({ ok: true });
}
