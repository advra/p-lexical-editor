import { NextRequest, NextResponse } from 'next/server';
import {
  ProcSessionModel,
  toPublic,
} from '@/modules/proc-sessions/models/proc-session-model';
import { getSessionFromCookie } from '@/lib/utils/auth';
import { _isoDateTime } from 'zod/v4/core';

// GET /api/proc-sessions?procId={procId}&sessionId={sessionId}&username={username}&status={status}
/*
  Query for sessions using procId, sessionId, username, and status
*/
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const procId = searchParams.get('procId');
    const sessionId = searchParams.get('sessionId');
    const username = searchParams.get('username');
    const status = searchParams.get('status');

    if (!procId) {
      return NextResponse.json(
        { error: 'procId is required' },
        { status: 400 },
      );
    }

    let query: any = { procId };

    if (sessionId) {
      query._id = sessionId;
    }

    if (username) {
      query.createdBy = username;
    }

    if (status) {
      query.status = status;
    }

    const sessions = await ProcSessionModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      sessions: sessions.map(toPublic),
    });
  } catch (error) {
    console.error('Failed to fetch proc sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proc sessions' },
      { status: 500 },
    );
  }
}

// POST /api/proc-sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    const user = session?.user ?? null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { procId } = body;

    if (!procId) {
      return NextResponse.json(
        { error: 'procId is required' },
        { status: 400 },
      );
    }

    // Check if user already has an active session for this proc
    const existingUserSession = await ProcSessionModel.findOne({
      procId,
      createdBy: user.username,
      status: 'active',
    });

    if (existingUserSession) {
      // Return existing session instead of creating a new one
      return NextResponse.json({
        session: toPublic(existingUserSession),
      });
    }

    const procSession = await ProcSessionModel.create({
      procId,
      name: `session-${user.username}-${new Date(Date.now()).toISOString()}`,
      createdBy: user.username,
      status: 'active',
      records: [],
    });

    return NextResponse.json({
      session: toPublic(procSession),
    });
  } catch (error) {
    console.error('Failed to create proc session:', error);
    return NextResponse.json(
      { error: 'Failed to create proc session' },
      { status: 500 },
    );
  }
}

// PUT /api/proc-sessions - Update session or add/update records
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    const user = session?.user ?? null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, recordId, state, dcn, redlineContent, status } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 },
      );
    }

    let updateData: any = {};

    // If updating a record within the session
    if (recordId && state) {
      const recordUpdate = {
        recordId,
        blockType: body.blockType || 'TaskItem', // Default to TaskItem if not specified
        state,
        updatedBy: user.username,
        updatedAt: new Date(),
        data: body.data || {}, // Include any additional data
      };

      // Find if record already exists in session
      const procSession = await ProcSessionModel.findById(sessionId);
      if (!procSession) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 },
        );
      }

      const existingRecordIndex = procSession.records.findIndex(
        (r) => r.recordId === recordId,
      );

      if (existingRecordIndex >= 0) {
        // Update existing record
        updateData.$set = {
          [`records.${existingRecordIndex}`]: recordUpdate,
        };
      } else {
        // Add new record
        updateData.$push = {
          records: recordUpdate,
        };
      }
    }

    // If updating session status
    if (status) {
      updateData.$set = {
        ...updateData.$set,
        status,
        updatedAt: new Date(),
      };
    }

    // If no update data was set, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update data provided' },
        { status: 400 },
      );
    }

    const updatedSession = await ProcSessionModel.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true },
    );

    if (!updatedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      session: toPublic(updatedSession),
    });
  } catch (error) {
    console.error('Failed to update proc session:', error);
    return NextResponse.json(
      { error: 'Failed to update proc session' },
      { status: 500 },
    );
  }
}

// DELETE /api/proc-sessions - Delete a session
export async function DELETE(request: NextRequest) {
  try {
    const cookie = request.cookies.get('user-session')?.value;
    if (!cookie)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    let user;
    try {
      user = JSON.parse(cookie);
    } catch {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 },
      );
    }

    await ProcSessionModel.findByIdAndDelete(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete proc session:', error);
    return NextResponse.json(
      { error: 'Failed to delete proc session' },
      { status: 500 },
    );
  }
}
