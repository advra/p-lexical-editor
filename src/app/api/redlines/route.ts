import { NextResponse } from 'next/server';
import { RedlineModel } from '@/modules/redlines/models/redline-model';
import { getSessionFromCookie } from '@/lib/utils/auth';
import dbConnect from '@/lib/db/mongodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const session = await getSessionFromCookie();
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { procId, blockId, target, dcn, originalText, newText } = body;

    // Validate required fields
    if (!procId || !blockId || !target || !dcn || !originalText || !newText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check if there's already a redline for this block and target by the same user
    const existingRedline = await RedlineModel.findOne({
      procId,
      blockId,
      target,
      userId: session.user.username,
    });

    if (existingRedline) {
      // Update existing redline
      existingRedline.dcn = dcn;
      existingRedline.newText = newText;
      existingRedline.updatedAt = new Date();
      await existingRedline.save();

      return NextResponse.json(
        {
          redline: existingRedline,
        },
        { status: 200 },
      );
    } else {
      // Create new redline item
      const redlineId = `${procId}_${blockId}_${dcn}_${Date.now()}`;
      
      const newRedline = await RedlineModel.create({
        procId,
        blockId,
        dcn,
        redlineId,
        target,
        originalText,
        newText,
        userId: session.user.username,
        status: 'pending',
        comments: [],
      });

      return NextResponse.json(
        {
          redline: newRedline,
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error('Failed to create/update redline:', error);
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

    // Build query
    const query: any = { procId };
    if (blockId) {
      query.blockId = blockId;
    }

    // Find all redlines for the proc
    const redlines = await RedlineModel.find(query)
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({ redlines });
  } catch (error) {
    console.error('Failed to fetch redlines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const session = await getSessionFromCookie();
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { procId, redlineId, dcn, newText } = body;

    // Validate required fields
    if (!procId || !redlineId || !dcn || !newText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Find the specific redline
    const redline = await RedlineModel.findOne({
      procId,
      redlineId,
    });

    if (!redline) {
      return NextResponse.json({ error: 'Redline not found' }, { status: 404 });
    }

    // Check if user owns the redline
    if (redline.userId !== session.user.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the redline
    redline.dcn = dcn;
    redline.newText = newText;
    redline.updatedAt = new Date();
    await redline.save();

    return NextResponse.json({
      redline,
    });
  } catch (error) {
    console.error('Failed to update redline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();

    const session = await getSessionFromCookie();
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { procId, redlineId } = body;

    // Validate required fields
    if (!procId || !redlineId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Find the specific redline
    const redline = await RedlineModel.findOne({
      procId,
      redlineId,
    });

    if (!redline) {
      return NextResponse.json({ error: 'Redline not found' }, { status: 404 });
    }

    // Check if user owns the redline
    if (redline.userId !== session.user.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the redline
    await RedlineModel.findByIdAndDelete(redline._id);

    return NextResponse.json({
      success: true,
      message: 'Redline deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete redline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
