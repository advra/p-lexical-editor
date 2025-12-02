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
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  sharedWith?: Array<{
    userId: string;
    permissions: { read?: boolean; edit?: boolean; execute?: boolean };
  }>;
  updatedAt: string | Date;
  data: Data;
  version: number;
  createdAt: string;
  publishedAt?: string | Date;
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
    
    return { procs, total: procs.length };
  } catch (error) {
    console.error('Error reading procs from database.json:', error);
    return { procs: [], total: 0 };
  }
};

export const getProcBySlug = (slug: string): ProcDoc | null => {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'database.json');
    if (!fs.existsSync(dbPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const allData: Record<string, any> = JSON.parse(fileContent);
    
    const key = `/procs/${slug}`;
    const value = allData[key];
    
    if (!value) {
      return null;
    }
    
    const title = value?.root?.props?.title || 'Untitled';
    const owner = value?.metadata?.createdBy || 'admin';
    const createdAt = value?.metadata?.createdAt || new Date().toISOString();
    const updatedAt = value?.metadata?.updatedAt || createdAt;
    const version = value?.metadata?.version || 1;
    
    return {
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
  } catch (error) {
    console.error('Error getting proc by slug from database.json:', error);
    return null;
  }
};
