import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

// Helper to read database
const readDatabase = (): Record<string, any> => {
  if (!fs.existsSync(DB_PATH)) {
    return {};
  }
  const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(fileContent);
};

/*
  Get all procs
*/
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const q = url.searchParams.get('q') ?? undefined;
    
    const db = readDatabase();
    const procs = [];
    
    for (const [key, value] of Object.entries(db)) {
      // Only process keys that start with /procs/
      if (key.startsWith('/procs/')) {
        const slug = key.replace('/procs/', '');
        const title = value?.root?.props?.title || 'Untitled';
        const owner = value?.metadata?.createdBy || 'admin';
        const createdAt = value?.metadata?.createdAt || new Date().toISOString();
        const updatedAt = value?.metadata?.updatedAt || createdAt;
        const version = value?.metadata?.version || 1;
        
        // Filter by query if provided
        if (q && !title.toLowerCase().includes(q.toLowerCase())) {
          continue;
        }
        
        procs.push({
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
        });
      }
    }
    
    // Sort by updatedAt descending (most recent first)
    procs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    // Apply limit
    const limitedProcs = procs.slice(0, limit);
    
    return NextResponse.json({
      procs: limitedProcs,
      total: procs.length,
      nextCursor: limitedProcs.length < procs.length ? limitedProcs.length.toString() : undefined,
    });
  } catch (error) {
    console.error('Error getting procs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
