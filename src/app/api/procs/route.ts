import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    const dbPath = path.join(process.cwd(), 'data', 'database.json');
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const allData: Record<string, any> = JSON.parse(fileContent);
    
    if (slug) {
      // Get single proc by slug
      const key = `/procs/${slug}`;
      const value = allData[key];
      
      if (!value) {
        return NextResponse.json({ error: 'Proc not found' }, { status: 404 });
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
        sharedWith: [],
        updatedAt,
        data: value,
        version,
        createdAt,
      };
      
      return NextResponse.json({ proc });
    } else {
      // Get all procs
      const procs = [];
      
      for (const [key, value] of Object.entries(allData)) {
        if (key.startsWith('/procs/')) {
          const slug = key.replace('/procs/', '');
          const title = value?.root?.props?.title || 'Untitled';
          const owner = value?.metadata?.createdBy || 'admin';
          const createdAt = value?.metadata?.createdAt || new Date().toISOString();
          const updatedAt = value?.metadata?.updatedAt || createdAt;
          const version = value?.metadata?.version || 1;
          
          procs.push({
            _id: slug,
            title,
            slug,
            owner,
            sharedWith: [],
            updatedAt,
            data: value,
            version,
            createdAt,
          });
        }
      }
      
      // Sort by updatedAt descending
      procs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      return NextResponse.json({ procs, total: procs.length });
    }
  } catch (error) {
    console.error('Error reading procs from database.json:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
