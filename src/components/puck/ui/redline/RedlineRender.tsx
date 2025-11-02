'use client';

/*
  This is a custom extension to support redlines. 
  Client processes the current proc component "blocks" by rading them, injecting the redline components in 
  the "applyRedlinesToBlock" method, and passing the modified blocks to the PuckRender component 
*/

import { Render as PuckRender } from '@measured/puck';
import { PuckPageData } from '@/app/puck/types';
import { RedLineModal } from '@/components/redline/RedLineModal';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import useUser from '@/hooks/use-user';

type RedlineState = {
  isOpen: boolean;
  originalText: string;
  dcn: string;
  newText: string;
  onSave: (dcn: string, description: string) => void;
};

type RedlineRenderProps = {
  config: any;
  data: PuckPageData;
  procId: string;
  room: string;
  onRedlineSave?: (
    dcn: string,
    newText: string,
    originalText: string,
    blockId: string,
  ) => void;
  onRedlineDeleted?: (redlineId: string) => void;
  redlineHoverEnabled?: boolean;
};

export const RedlineRender = ({
  config,
  data,
  procId,
  room,
  onRedlineSave,
  onRedlineDeleted,
  redlineHoverEnabled = false,
}: RedlineRenderProps) => {
  const { session } = useUser();
  const user = session?.user;
  const [redlineState, setRedlineState] = useState<RedlineState>({
    isOpen: false,
    originalText: '',
    dcn: '',
    newText: '',
    onSave: () => {},
  });
  const [currentBlockId, setCurrentBlockId] = useState<string>('');
  const [redlines, setRedlines] = useState<any[]>([]);

  // Fetch redlines when component mounts, when data changes, and handle socket events
  useEffect(() => {
    const fetchRedlines = async () => {
      try {
        const response = await fetch(`/api/redlines?procId=${procId}`);
        if (response.ok) {
          const result = await response.json();
          setRedlines(result.redlines || []);
          console.log(
            'Redlines loaded',
            JSON.stringify(result.redlines, null, 2),
          );
        }
      } catch (error) {
        console.error('Failed to fetch redlines:', error);
      }
    };

    fetchRedlines();

    // Listen for redline socket events
    const socket = getSocket();
    if (socket) {
      const handleRedlineCreated = (payload: { redline: any }) => {
        setRedlines((prev) => [...prev, payload.redline]);
      };

      const handleRedlineUpdated = (payload: {
        redlineId: string;
        patch: any;
      }) => {
        setRedlines((prev) =>
          prev.map((r) =>
            r.redlineId === payload.redlineId ? { ...r, ...payload.patch } : r,
          ),
        );
      };

      const handleRedlineDeleted = (payload: { redlineId: string }) => {
        console.log('Client: Received redline:deleted event', payload);
        setRedlines((prev) => {
          const newRedlines = prev.filter(
            (r) => r.redlineId !== payload.redlineId,
          );
          console.log('Client: Redlines after socket deletion:', newRedlines);
          return newRedlines;
        });
      };

      socket.on('redline:created', handleRedlineCreated);
      socket.on('redline:updated', handleRedlineUpdated);
      socket.on('redline:deleted', handleRedlineDeleted);

      return () => {
        socket.off('redline:created', handleRedlineCreated);
        socket.off('redline:updated', handleRedlineUpdated);
        socket.off('redline:deleted', handleRedlineDeleted);
      };
    }
  }, [procId, data]); // Add data as dependency to re-fetch when Puck data changes

  const handleRedlineModalClose = () => {
    setRedlineState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleRedlineModalSave = () => {
    redlineState.onSave(redlineState.dcn, redlineState.newText);
  };

  const handleRedlineDelete = async (redlineId: string) => {
    console.log('handleRedlineDelete called with redlineId:', redlineId);
    console.log('Current redlines before deletion:', redlines);

    try {
      const response = await fetch('/api/redlines', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procId,
          redlineId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete redline');
      }

      // Update current user's UI immediately
      setRedlines((prev) => {
        const newRedlines = prev.filter((r) => r.redlineId !== redlineId);
        console.log('Redlines after deletion:', newRedlines);
        return newRedlines;
      });

      // Call the original callback if provided
      onRedlineDeleted?.(redlineId);

      // Broadcast via socket to other users - use procId as the room
      const socket = getSocket();
      if (socket) {
        console.log('room deleted redline is', room, redlineId);
        socket.emit('redline:delete', { room, redlineId });
      }
    } catch (error) {
      console.error('Failed to delete redline:', error);
    }
  };

  const handleRedlineClick = (
    originalText: string,
    blockId: string,
    target: string = 'content',
  ) => {
    setCurrentBlockId(blockId);

    // Check if there's an existing redline for this block and target
    const existingRedline = redlines.find(
      (r) =>
        r.blockId === blockId &&
        r.target === target &&
        r.userId === session?.user?.username,
    );

    if (existingRedline && redlineHoverEnabled) return;

    setRedlineState({
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

          // Call the original callback if provided
          onRedlineSave?.(dcn, newText, originalText, blockId);
        } catch (error) {
          console.error('Failed to save redline:', error);
        } finally {
          setRedlineState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Function to apply redlines to block content
  const applyRedlinesToBlock = (block: any) => {
    const blockId = block?.props?.id;

    // Always provide the click handler so the modal can be opened
    const baseProps = {
      ...block.props,
      onRedlineClick: (originalText: string, target: string = 'content') =>
        handleRedlineClick(originalText, blockId, target),
      redlineHoverEnabled, // Pass the toggle state to blocks
    };

    // Get all redlines for this block
    const blockRedlines = redlines.filter((r) => r.blockId === blockId);

    // If no redlines, just return with the handler attached
    if (blockRedlines.length === 0) {
      return { ...block, props: baseProps };
    }

    // Group redlines by target
    const redlinesByTarget: { [target: string]: any[] } = {};
    blockRedlines.forEach((redline) => {
      if (!redlinesByTarget[redline.target]) {
        redlinesByTarget[redline.target] = [];
      }
      redlinesByTarget[redline.target].push(redline);
    });

    // Get the latest redline for each target
    const latestRedlinesByTarget: { [target: string]: any } = {};
    Object.entries(redlinesByTarget).forEach(([target, targetRedlines]) => {
      const latestRedline = targetRedlines.reduce((latest, current) =>
        new Date(current.createdAt) > new Date(latest.createdAt)
          ? current
          : latest,
      );
      latestRedlinesByTarget[target] = latestRedline;
    });

    // inject redline attributes per block
    return {
      ...block,
      props: {
        ...baseProps,
        isRedlined: true,
        redlinesByTarget: latestRedlinesByTarget,
        onRedlineDelete: handleRedlineDelete,
      },
    };
  };

  // Build modified data safely (even if content is undefined)
  const modifiedData = {
    ...data,
    content: (data.content ?? []).map((block) => applyRedlinesToBlock(block)),
  };

  // Create a modified data object that applies redlines and injects onRedlineClick
  console.log('modifieddata', modifiedData);

  return (
    <>
      <PuckRender config={config} data={modifiedData} />

      <RedLineModal
        loading={false}
        originalText={redlineState.originalText}
        dcn={redlineState.dcn}
        newText={redlineState.newText}
        handleCloseRedlineModal={handleRedlineModalClose}
        handleSaveRedlineModal={handleRedlineModalSave}
        setDcn={(dcn: string) => setRedlineState((prev) => ({ ...prev, dcn }))}
        setNewText={(newText: string) =>
          setRedlineState((prev) => ({ ...prev, newText }))
        }
        showRedlineModal={redlineState.isOpen}
      />
    </>
  );
};
