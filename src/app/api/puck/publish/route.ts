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

  // Extract just the UUID part from the path for the slug
  // Path format: /procs/{uuid}
  const pathParts = path.split('/');
  const slug = pathParts[pathParts.length - 1]; // Get the last part (UUID)

  const proc = await caller.procs.create({
    data: createProcRequest.data,
    title: title ?? 'New',
    description: description ?? undefined,
    tags: tags ?? [],
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
