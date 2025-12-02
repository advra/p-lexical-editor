import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type PutBody = {
  data: any;
  description?: string;
  tags?: string[];
  published?: boolean;
};

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

// Helper to read database
const readDatabase = (): Record<string, any> => {
  if (!fs.existsSync(DB_PATH)) {
    return {};
  }
  const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(fileContent);
};

// Helper to write database
const writeDatabase = (data: Record<string, any>) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

/*
    Get a specific proc by slug
*/
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const db = readDatabase();
    const key = `/procs/${slug}`;
    const value = db[key];
    
    if (!value) {
      return NextResponse.json(
        { error: 'Proc not found' },
        { status: 404 }
      );
    }
    
    const title = value?.root?.props?.title || 'Untitled';
    const owner = value?.metadata?.createdBy || 'admin';
    const createdAt = value?.metadata?.createdAt || new Date().toISOString();
    const updatedAt = value?.metadata?.updatedAt || createdAt;
    const version = value?.metadata?.version || 1;
    
    const proc = {
      _id: slug,
      title,
      slug,
      owner,
      status: 'published' as const,
      tags: value?.root?.props?.tags || [],
      sharedWith: [],
      updatedAt,
      data: value,
      version,
      createdAt,
      publishedAt: value?.metadata?.publishedAt || createdAt,
    };
    
    return NextResponse.json(proc);
  } catch (error) {
    console.error('Error getting proc:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/*
  Update (publish) an existing proc
*/
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { data, description, tags, published }: PutBody = await req.json();

    // Build metadata
    const titleFromRoot = data?.root?.props?.title as string | undefined;
    const db = readDatabase();
    const key = `/procs/${slug}`;
    const existing = db[key];
    
    const now = new Date().toISOString();
    const metadata = {
      title: titleFromRoot ?? 'Untitled',
      version: (existing?.metadata?.version ?? 0) + 1,
      updatedAt: now,
      createdBy: existing?.metadata?.createdBy || 'admin',
      createdAt: existing?.metadata?.createdAt || now,
      ...(published ? { publishedAt: now } : {}),
    };
    
    const finalData = { ...data, metadata };
    
    // Update database
    db[key] = finalData;
    writeDatabase(db);
    
    revalidatePath(`/procs/${slug}`);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('PUT /procs/[slug] error:', err);
    return NextResponse.json(
      { status: 'error', message: err?.message ?? 'Internal error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const db = readDatabase();
    const key = `/procs/${slug}`;
    
    if (!db[key]) {
      return NextResponse.json(
        { error: 'Proc not found' },
        { status: 404 }
      );
    }
    
    delete db[key];
    writeDatabase(db);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting proc:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
