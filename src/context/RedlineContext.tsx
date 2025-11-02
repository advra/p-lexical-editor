'use client';

import { getSocket } from '@/lib/socket';
import { Redline } from '@/modules/redlines/models/redline-model';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// modal state (if closed set to null)
type RedlineModalStateType = {
  isOpen: boolean;
  originalText: string;
  dcn: string;
  newText: string;
  onSave: (dcn: string, description: string) => void;
} | null;

interface RedlineContextType {
  // getter setters
  redlines: Redline[];
  setRedlines: React.Dispatch<React.SetStateAction<Redline[]>>;

  selectedRedlineId: string | null;
  setSelectedRedlineId: React.Dispatch<React.SetStateAction<string | null>>;

  selectedBlockId: string | null;
  setSelectedBlockId: React.Dispatch<React.SetStateAction<string | null>>;

  redlineHoverEnabled: boolean;
  setRedlineHoverEnabled: React.Dispatch<React.SetStateAction<boolean>>;

  // redline modal state
  redlineModalState: RedlineModalStateType;
  setRedlineModalState: React.Dispatch<
    React.SetStateAction<RedlineModalStateType>
  >;

  // redline sidebar handling
  openRedlineSidebar: (redlineId: string) => void;
  closeRedlineSidebar: () => void;

  // redline operations
  openRedlineModal: (
    room: string,
    procId: string,
    blockId: string,
    originalText: string,
    target: string,
    existingRedline: any,
  ) => void;
}

const RedlineContext = createContext<RedlineContextType | undefined>(undefined);

interface RedlineProviderProps {
  children: ReactNode;
}

export const RedlineProvider: React.FC<RedlineProviderProps> = ({
  children,
}) => {
  // core states
  const [redlines, setRedlines] = useState<Redline[]>([]);
  const [selectedRedlineId, setSelectedRedlineId] = useState<string | null>(
    null,
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [redlineHoverEnabled, setRedlineHoverEnabled] = useState(false);
  const [redlineModalState, setRedlineModalState] =
    useState<RedlineModalStateType>(null);

  const openRedlineSidebar = (redlineId: string) =>
    setSelectedRedlineId(redlineId);
  const closeRedlineSidebar = () => setSelectedRedlineId(null);

  const openRedlineModal = (
    room: string,
    procId: string,
    blockId: string,
    originalText: string,
    target: string,
    existingRedline: any,
  ) => {
    setRedlineModalState({
      isOpen: true,
      originalText,
      dcn: existingRedline?.dcn || '',
      newText: existingRedline?.newText || '',
      onSave: async (dcn: string, newText: string) => {
        try {
          let redline: any;

          if (existingRedline) {
            // Update existing redline
            const response = await fetch('/api/redlines', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                procId,
                redlineId: existingRedline.redlineId,
                dcn,
                newText,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to update redline');
            }

            const result = await response.json();
            redline = result.redline;

            // Update current user's UI immediately
            setRedlines((prev) =>
              prev.map((r) =>
                r.redlineId === existingRedline.redlineId ? redline : r,
              ),
            );

            // Broadcast via socket to other users
            const socket = getSocket();
            if (socket) {
              socket.emit('redline:update', {
                room,
                redlineId: existingRedline.redlineId,
                patch: { dcn, newText },
              });
            }
          } else {
            // Create new redline
            const response = await fetch('/api/redlines', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                procId,
                blockId,
                target,
                dcn,
                originalText,
                newText,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to create redline');
            }

            const result = await response.json();
            redline = result.redline;

            // Update current user's UI immediately
            setRedlines((prev) => [...prev, redline]);

            // Broadcast via socket to other users
            const socket = getSocket();
            if (socket) {
              socket.emit('redline:create', { room, redline });
            }
          }
        } catch (error) {
          console.error('Failed to save redline:', error);
        } finally {
          setRedlineModalState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const value = {
    redlines,
    setRedlines,
    selectedRedlineId,
    setSelectedRedlineId,
    selectedBlockId,
    setSelectedBlockId,
    redlineHoverEnabled,
    setRedlineHoverEnabled,
    redlineModalState,
    setRedlineModalState,
    openRedlineSidebar,
    closeRedlineSidebar,
    openRedlineModal,
  };

  return (
    <RedlineContext.Provider value={value}>{children}</RedlineContext.Provider>
  );
};

export const useRedline = (): RedlineContextType => {
  const context = useContext(RedlineContext);
  if (context === undefined) {
    throw new Error('useRedline must be used within a RedlineProvider');
  }
  return context;
};
