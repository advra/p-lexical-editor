import { NextResponse } from 'next/server';
import { PuckPageData } from '@/app/puck/types';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';

type createRequestProps = {
  path: string;
  data: PuckPageData;
};

/*
  Get all procs
*/
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') ?? 20);
  const cursor = url.searchParams.get('cursor') ?? undefined;
  const q = url.searchParams.get('q') ?? undefined;

  const caller = appRouter.createCaller(await createTRPCContext());
  const data = await caller.procs.listAll({ limit, cursor, query: q });
  return NextResponse.json(data);
}
