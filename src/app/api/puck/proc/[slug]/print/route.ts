import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';

/*
    Get print data of a specific proc by slug
*/
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const caller = appRouter.createCaller(await createTRPCContext());
  const proc = await caller.procs.getOne({ by: 'slug', slug });

  // revalidatePath(`proc/${slug}`);
  return NextResponse.json(proc);
}
