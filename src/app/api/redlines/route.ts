import { NextResponse } from 'next/server';
import { ProcRedlinesModel } from '@/modules/redlines/models/redline-model';
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

    // Find or create the proc redlines document
    let procRedlines = await ProcRedlinesModel.findOne({ procId });

    if (!procRedlines) {
      // Create new proc redlines document
      procRedlines = await ProcRedlinesModel.create({
        procId,
        blocks: new Map(),
      });
    }

    // Initialize blocks if it doesn't exist
    if (!procRedlines.blocks) {
      procRedlines.blocks = new Map();
    }

    // Initialize block if it doesn't exist
    if (!procRedlines.blocks.get(blockId)) {
      procRedlines.blocks.set(blockId, {
        blockId,
        redlines: new Map(),
      });
    }

    // Get the block and check if there's already a redline for this block and target by the same user
    const block = procRedlines.blocks.get(blockId);
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    const existingRedline = block.redlines.get(target);
    const isExisting =
      existingRedline && existingRedline.userId === session.user.username;

    if (isExisting) {
      // Update existing redline
      block.redlines.set(target, {
        ...existingRedline,
        dcn,
        newText,
        updatedAt: new Date(),
      });
    } else {
      // Create new redline item
      const newRedline = {
        redlineId: uuidv4(),
        blockId,
        target,
        dcn,
        originalText,
        newText,
        userId: session.user.username,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      block.redlines.set(target, newRedline);
    }

    await procRedlines.save();

    const savedRedline = block.redlines.get(target);

    return NextResponse.json(
      {
        redline: savedRedline,
      },
      { status: 201 },
    );
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

    // Find the proc redlines document
    const procRedlines = await ProcRedlinesModel.findOne({ procId });

    if (!procRedlines || !procRedlines.blocks) {
      return NextResponse.json({ redlines: [] });
    }

    let allRedlines: any[] = [];

    // Convert blocks map to array of redlines
    procRedlines.blocks.forEach((block) => {
      if (block.redlines) {
        block.redlines.forEach((redline) => {
          allRedlines.push(redline);
        });
      }
    });

    // Filter by blockId if provided
    if (blockId) {
      allRedlines = allRedlines.filter((r) => r.blockId === blockId);
    }

    // Sort by creation date (newest first)
    allRedlines.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({ redlines: allRedlines });
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

    // Find the proc redlines document
    const procRedlines = await ProcRedlinesModel.findOne({ procId });
    if (!procRedlines || !procRedlines.blocks) {
      return NextResponse.json(
        { error: 'Proc redlines not found' },
        { status: 404 },
      );
    }

    // Find the specific redline by redlineId
    let targetRedline: any = null;
    let targetBlockId: string = '';
    let targetTarget: string = '';

    // Search through all blocks and targets to find the redline
    procRedlines.blocks.forEach((block, blockId) => {
      block.redlines.forEach((redline, target) => {
        if (redline.redlineId === redlineId) {
          targetRedline = redline;
          targetBlockId = blockId;
          targetTarget = target;
        }
      });
    });

    if (!targetRedline) {
      return NextResponse.json({ error: 'Redline not found' }, { status: 404 });
    }

    // Check if user owns the redline
    if (targetRedline.userId !== session.user.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the block and update the redline
    const block = procRedlines.blocks.get(targetBlockId);
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Update the redline
    block.redlines.set(targetTarget, {
      ...targetRedline,
      dcn,
      newText,
      updatedAt: new Date(),
    });

    await procRedlines.save();

    const updatedRedline = block.redlines.get(targetTarget);

    return NextResponse.json({
      redline: updatedRedline,
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

    // Find the proc redlines document
    const procRedlines = await ProcRedlinesModel.findOne({ procId });
    if (!procRedlines || !procRedlines.blocks) {
      return NextResponse.json(
        { error: 'Proc redlines not found' },
        { status: 404 },
      );
    }

    // Find the specific redline by redlineId
    let targetRedline: any = null;
    let targetBlockId: string = '';
    let targetTarget: string = '';

    // Search through all blocks and targets to find the redline
    procRedlines.blocks.forEach((block, blockId) => {
      block.redlines.forEach((redline, target) => {
        if (redline.redlineId === redlineId) {
          targetRedline = redline;
          targetBlockId = blockId;
          targetTarget = target;
        }
      });
    });

    if (!targetRedline) {
      return NextResponse.json({ error: 'Redline not found' }, { status: 404 });
    }

    // Check if user owns the redline
    if (targetRedline.userId !== session.user.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the block and delete the redline
    const block = procRedlines.blocks.get(targetBlockId);
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Delete the redline
    block.redlines.delete(targetTarget);

    await procRedlines.save();

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
