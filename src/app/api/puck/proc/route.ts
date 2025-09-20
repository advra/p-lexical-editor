import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { PuckPageData } from '@/app/puck/types';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

type createRequestProps = {
  path: string;
  data: PuckPageData;
};

/*
  Use to create a new proc
*/
export async function POST(request: Request) {
  const createProcRequest: createRequestProps = await request.json();
  const caller = appRouter.createCaller(await createTRPCContext());

  const { title, description, tags } = createProcRequest.data.root;
  const path = createProcRequest.path;

  // Extract just the UUID part from the path for the slug
  // Path format: /procs/{uuid}
  const pathParts = path.split('/');
  const slug = pathParts[pathParts.length - 1];

  const proc = await caller.procs.create({
    data: createProcRequest.data,
    slug: slug,
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
