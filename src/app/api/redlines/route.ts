import { NextResponse } from 'next/server';
import { RedlineModel } from '@/modules/redlines/models/redline-model';
import { getSessionFromCookie } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const session = await getSessionFromCookie();
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { procId, blockId, dcn, originalText, newText, description } = body;

    // Validate required fields
    if (
      !procId ||
      !blockId ||
      !dcn ||
      !originalText ||
      !newText ||
      !description
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create redline in database
    const redline = await RedlineModel.create({
      procId,
      blockId,
      dcn,
      originalText,
      newText,
      description,
      userId: session.user.username,
      status: 'pending',
    });

    return NextResponse.json({ redline }, { status: 201 });
  } catch (error) {
    console.error('Failed to create redline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const session = await getSessionFromCookie();
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const procId = searchParams.get('procId');
    const blockId = searchParams.get('blockId');

    if (!procId) {
      return NextResponse.json(
        { error: 'procId is required' },
        { status: 400 },
      );
    }

    const filter: any = { procId };
    if (blockId) {
      filter.blockId = blockId;
    }

    const redlines = await RedlineModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ redlines });
  } catch (error) {
    console.error('Failed to fetch redlines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
