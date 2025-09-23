import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { PuckPageData } from '@/app/puck/types';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

type CtxParams = { params: { slug: string } };

/*
    Get print data of a specific proc by slug
*/
export async function GET(_req: Request, { params }: CtxParams) {
  const caller = appRouter.createCaller(await createTRPCContext());
  const proc = await caller.procs.getOne({ by: 'slug', id: params.slug });
  return NextResponse.json(proc);
}
