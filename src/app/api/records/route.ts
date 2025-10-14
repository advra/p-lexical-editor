import { NextResponse } from 'next/server';
import { RecordModel, toPublic } from '@/modules/records/models/record-model';
import { appRouter } from '@/trpc/routers/_app';
import { createTRPCContext } from '@/trpc/init';

// GET /api/records?procId={procId}&recordId={recordId}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const procId = searchParams.get('procId');
    const recordId = searchParams.get('recordId');

    if (!procId) {
      return NextResponse.json(
        { error: 'procId is required' },
        { status: 400 },
      );
    }

    let query: any = { procId };

    if (recordId) {
      query.recordId = recordId;
    }

    const records = await RecordModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      records: records.map(toPublic),
    });
  } catch (error) {
    console.error('Failed to fetch records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 },
    );
  }
}

// POST /api/records - Create or update a record
export async function POST(request: Request) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const user = await caller.auth.me();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recordId, procId, state, dcn, redlineContent } = body;

    if (!recordId || !procId) {
      return NextResponse.json(
        { error: 'recordId and procId are required' },
        { status: 400 },
      );
    }

    // Find existing record or create new one
    const existingRecord = await RecordModel.findOne({ recordId, procId });

    const updateData = {
      state: state || 'pending',
      lastUpdatedBy: user.username,
      ...(dcn !== undefined && { dcn }),
      ...(redlineContent !== undefined && { redlineContent }),
      isRedlined: redlineContent ? true : false,
    };

    let record;
    if (existingRecord) {
      record = await RecordModel.findOneAndUpdate(
        { recordId, procId },
        updateData,
        { new: true },
      );
    } else {
      record = await RecordModel.create({
        recordId,
        procId,
        ...updateData,
      });
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Failed to create/update record' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      record: toPublic(record),
    });
  } catch (error) {
    console.error('Failed to create/update record:', error);
    return NextResponse.json(
      { error: 'Failed to create/update record' },
      { status: 500 },
    );
  }
}

// PUT /api/records - Update record state
export async function PUT(request: Request) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const user = await caller.auth.me();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recordId, procId, state, dcn, redlineContent } = body;

    if (!recordId || !procId || !state) {
      return NextResponse.json(
        { error: 'recordId, procId, and state are required' },
        { status: 400 },
      );
    }

    const updateData = {
      state,
      lastUpdatedBy: user.username,
      ...(dcn !== undefined && { dcn }),
      ...(redlineContent !== undefined && { redlineContent }),
      isRedlined: redlineContent ? true : false,
    };

    const record = await RecordModel.findOneAndUpdate(
      { recordId, procId },
      updateData,
      { new: true, upsert: true },
    );

    if (!record) {
      return NextResponse.json(
        { error: 'Failed to update record' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      record: toPublic(record),
    });
  } catch (error) {
    console.error('Failed to update record:', error);
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 },
    );
  }
}

// DELETE /api/records - Delete a record
export async function DELETE(request: Request) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const user = await caller.auth.me();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recordId, procId } = body;

    if (!recordId || !procId) {
      return NextResponse.json(
        { error: 'recordId and procId are required' },
        { status: 400 },
      );
    }

    await RecordModel.findOneAndDelete({ recordId, procId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 },
    );
  }
}
