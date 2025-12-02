import { Data } from '@measured/puck';
import fs from 'fs';
import path from 'path';

// Replace with call to your database
export const getPage = (pagePath: string) => {
  const allData: Record<string, Data> | null = fs.existsSync('database.json')
    ? JSON.parse(fs.readFileSync('database.json', 'utf-8'))
    : null;

  return allData ? allData[pagePath] : null;
};

export interface ProcDoc {
  _id: string;
  title: string;
  slug: string;
  owner: string;
  sharedWith?: Array<{
    userId: string;
    permissions: { read?: boolean; edit?: boolean; execute?: boolean };
  }>;
  updatedAt: string | Date;
  data: Data;
  version: number;
  createdAt: string;
}

export const getAllProcs = (): { procs: ProcDoc[]; total: number } => {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'database.json');
    if (!fs.existsSync(dbPath)) {
      return { procs: [], total: 0 };
    }

    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const allData: Record<string, any> = JSON.parse(fileContent);
    
    const procs: ProcDoc[] = [];
    
    for (const [key, value] of Object.entries(allData)) {
      // Only process keys that start with /procs/
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
    
    // Sort by updatedAt descending (most recent first)
    procs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    return { procs, total: procs.length };
  } catch (error) {
    console.error('Error reading procs from database.json:', error);
    return { procs: [], total: 0 };
  }
};
