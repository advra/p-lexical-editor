import fs from 'fs';
import path from 'path';
import { Redline } from '@/modules/redlines/models/redline-model';

const REDLINES_FILE = path.join(process.cwd(), 'data', 'redlines.json');

// Initialize redlines file if it doesn't exist
const initializeRedlinesFile = () => {
  if (!fs.existsSync(REDLINES_FILE)) {
    fs.writeFileSync(REDLINES_FILE, JSON.stringify({ redlines: [] }, null, 2));
  }
};

// Read all redlines from file
export const getAllRedlines = (): Redline[] => {
  try {
    initializeRedlinesFile();
    const fileContent = fs.readFileSync(REDLINES_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.redlines || [];
  } catch (error) {
    console.error('Error reading redlines from file:', error);
    return [];
  }
};

// Get redlines by procId and optionally blockId
export const getRedlinesByProc = (procId: string, blockId?: string): Redline[] => {
  const allRedlines = getAllRedlines();
  return allRedlines.filter(redline => {
    if (redline.procId !== procId) return false;
    if (blockId && redline.blockId !== blockId) return false;
    return true;
  });
};

// Get redline by redlineId
export const getRedlineById = (procId: string, blockId: string, redlineId: string): Redline | null => {
  const allRedlines = getAllRedlines();
  return allRedlines.find(redline => 
    redline.procId === procId && 
    redline.blockId === blockId && 
    redline.redlineId === redlineId
  ) || null;
};

// Save a redline (create or update)
export const saveRedline = (redline: Omit<Redline, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string }): Redline => {
  try {
    initializeRedlinesFile();
    const allRedlines = getAllRedlines();
    
    const now = new Date();
    const existingIndex = allRedlines.findIndex(r => r.redlineId === redline.redlineId);
    
    let savedRedline: Redline;
    
    if (existingIndex >= 0) {
      // Update existing redline
      savedRedline = {
        ...allRedlines[existingIndex],
        ...redline,
        updatedAt: now,
      };
      allRedlines[existingIndex] = savedRedline;
    } else {
      // Create new redline
      savedRedline = {
        _id: redline._id || `redline_${Date.now()}`,
        ...redline,
        createdAt: now,
        updatedAt: now,
      };
      allRedlines.push(savedRedline);
    }
    
    // Save to file
    fs.writeFileSync(REDLINES_FILE, JSON.stringify({ redlines: allRedlines }, null, 2));
    
    return savedRedline;
  } catch (error) {
    console.error('Error saving redline:', error);
    throw error;
  }
};

// Delete a redline
export const deleteRedline = (procId: string, redlineId: string): boolean => {
  try {
    initializeRedlinesFile();
    const allRedlines = getAllRedlines();
    const initialLength = allRedlines.length;
    
    const filteredRedlines = allRedlines.filter(redline => 
      !(redline.procId === procId && redline.redlineId === redlineId)
    );
    
    if (filteredRedlines.length === initialLength) {
      return false; // Redline not found
    }
    
    // Save to file
    fs.writeFileSync(REDLINES_FILE, JSON.stringify({ redlines: filteredRedlines }, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting redline:', error);
    return false;
  }
};

// Add comment to redline
export const addCommentToRedline = (
  procId: string, 
  blockId: string, 
  redlineId: string, 
  comment: { comment: string; userId: string }
): Redline | null => {
  try {
    const redline = getRedlineById(procId, blockId, redlineId);
    if (!redline) return null;
    
    const newComment = {
      _id: `comment_${Date.now()}`,
      ...comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedRedline = {
      ...redline,
      comments: [...(redline.comments || []), newComment],
      updatedAt: new Date(),
    };
    
    return saveRedline(updatedRedline);
  } catch (error) {
    console.error('Error adding comment to redline:', error);
    return null;
  }
};
