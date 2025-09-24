import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { PuckPageData } from '@/app/puck/types';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { PuckPageDataInput } from '@/modules/procs/server/schemas';
import { slugify } from '@/modules/procs/utils/title-generator';

type createRequestProps = {
  // title: string;
  // description?: string;
  // tags?: string[];
  // path: string;
  data: PuckPageDataInput;
};

/*
  Use to create a new proc
*/
export async function POST(request: Request) {
  const createProcRequest: createRequestProps = await request.json();
  const caller = appRouter.createCaller(await createTRPCContext());

  const { title, description, tags } = createProcRequest.data.root.props;
  // const path = createProcRequest.path;

  // Extract just the UUID part from the path for the slug
  // Path format: /procs/{uuid}
  // const pathParts = path.split('/');
  // const slug = pathParts[pathParts.length - 1];

  const proc = await caller.procs.create({
    title: title,
    description: description,
    tags: tags,
    data: createProcRequest.data,
  });

  // `proc` should be your ProcPublic (includes `_id` and `slug`)
  const body = {
    id: proc._id,
    slug: proc.slug,
    path: `/procs/${proc.slug}`,
    proc, // optional: include the whole proc if you want it on the client
  };

  if (!proc) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to write DB' },
      { status: 500 },
    );
  }

  // Purge Next.js cache
  // revalidatePath(`/procs/${proc.slug}`);

  // return NextResponse.json({ status: 'ok' });
  return new NextResponse(JSON.stringify(body), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      Location: body.path, // nice-to-have
    },
  });
}
