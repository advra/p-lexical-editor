import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PuckPageDataInput } from '@/modules/procs/server/schemas';
import { slugify } from '@/modules/procs/utils/title-generator';

type createRequestProps = {
  data: PuckPageDataInput;
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
  Use to create a new proc
*/
export async function POST(request: Request) {
  try {
    const createProcRequest: createRequestProps = await request.json();
    const { title, description, tags } = createProcRequest.data.root.props;
    
    // Generate slug from title
    const slug = slugify(title);
    const now = new Date().toISOString();
    
    // Build metadata
    const metadata = {
      title: title || 'Untitled',
      description: description || '',
      createdBy: 'admin', // TODO: Get from user session
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    
    const finalData = { ...createProcRequest.data, metadata };
    
    // Save to database
    const db = readDatabase();
    const key = `/procs/${slug}`;
    
    // Check if proc already exists
    if (db[key]) {
      return NextResponse.json(
        { error: 'Proc with this slug already exists' },
        { status: 409 }
      );
    }
    
    db[key] = finalData;
    writeDatabase(db);
    
    const proc = {
      _id: slug,
      title: title || 'Untitled',
      slug,
      owner: 'admin',
      status: 'published' as const,
      tags: tags || [],
      sharedWith: [],
      updatedAt: now,
      data: finalData,
      version: 1,
      createdAt: now,
      publishedAt: now,
    };
    
    const body = {
      id: proc._id,
      slug: proc.slug,
      path: `/procs/${proc.slug}`,
      proc,
    };

    // Purge Next.js cache
    revalidatePath(body.path);

    return new NextResponse(JSON.stringify(body), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        Location: body.path,
      },
    });
  } catch (error) {
    console.error('Error creating proc:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
