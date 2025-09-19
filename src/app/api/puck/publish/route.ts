import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { PuckPageData } from '@/app/puck/types';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';

type createRequestProps = {
  path: string;
  data: PuckPageData;
};

export async function POST(request: Request) {
  const createProcRequest: createRequestProps = await request.json();
  const caller = appRouter.createCaller(await createTRPCContext());

  console.log(
    'createProcRequest: ',
    JSON.stringify(createProcRequest, null, 2),
  );
  const { title, description, tags } = createProcRequest.data.root;
  const path = createProcRequest.path;
  // if (!title) {
  //   return NextResponse.json(
  //     { status: 'error', message: 'Title is required' },
  //     { status: 400 },
  //   );
  // }

  const proc = await caller.procs.create({
    data: createProcRequest.data,
    title: title ?? 'New',
    description: description ?? undefined,
    tags: tags ?? [],
    slug: path,
  });

  if (!proc) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to write DB' },
      { status: 500 },
    );
  }

  // Purge Next.js cache
  revalidatePath(createProcRequest.path);

  return NextResponse.json({ status: 'ok' });
}
