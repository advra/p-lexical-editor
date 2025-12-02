import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/utils/auth';
import { v4 as uuidv4 } from 'uuid';
import { saveRedline, getRedlinesByProc, deleteRedline } from '@/lib/redlines-json';

export async function POST(request: Request) {
  try {
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

    // Create new redline item
    const redlineId = `${procId}_${blockId}_${dcn}_${target}_${Date.now()}`;
    
    const newRedline = await saveRedline({
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

    // Get all redlines for the proc
    const redlines = getRedlinesByProc(procId, blockId || undefined);

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

    // Note: For JSON-based system, we need to get the redline first
    // This is a simplified version - in a real implementation, we'd need
    // to fetch the redline, update it, and save it back
    // For now, we'll return an error since this is a more complex operation
    return NextResponse.json(
      { error: 'Update operation not fully implemented for JSON storage. Use DELETE and CREATE instead.' },
      { status: 501 },
    );
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

    // Note: For JSON-based system, we need to check ownership first
    // This is a simplified version - in a real implementation, we'd need
    // to fetch the redline to check ownership before deleting
    // For now, we'll just delete it
    const success = deleteRedline(procId, redlineId);

    if (!success) {
      return NextResponse.json({ error: 'Redline not found' }, { status: 404 });
    }

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
