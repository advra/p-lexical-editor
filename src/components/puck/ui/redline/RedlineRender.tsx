'use client';

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
  description: string;
  onSave: (dcn: string, description: string) => void;
};

type RedlineRenderProps = {
  config: any;
  data: PuckPageData;
  procId: string;
  room: string;
  onRedlineSave?: (
    dcn: string,
    description: string,
    originalText: string,
    blockId: string,
  ) => void;
};

export const RedlineRender = ({
  config,
  data,
  procId,
  room,
  onRedlineSave,
}: RedlineRenderProps) => {
  const { session } = useUser();
  const [redlineState, setRedlineState] = useState<RedlineState>({
    isOpen: false,
    originalText: '',
    dcn: '',
    description: '',
    onSave: () => {},
  });
  const [currentBlockId, setCurrentBlockId] = useState<string>('');
  const [redlines, setRedlines] = useState<any[]>([]);

  // Fetch redlines when component mounts and handle socket events
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
            r._id === payload.redlineId ? { ...r, ...payload.patch } : r,
          ),
        );
      };

      const handleRedlineDeleted = (payload: { redlineId: string }) => {
        setRedlines((prev) => prev.filter((r) => r._id !== payload.redlineId));
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
  }, [procId]);

  const handleCloseRedlineModal = () => {
    setRedlineState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveRedlineModal = () => {
    redlineState.onSave(redlineState.dcn, redlineState.description);
  };

  const handleRedlineClick = (originalText: string, blockId: string) => {
    setCurrentBlockId(blockId);
    setRedlineState({
      isOpen: true,
      originalText,
      dcn: '',
      description: '',
      onSave: async (dcn: string, description: string) => {
        try {
          // Create redline in database via API call
          const response = await fetch('/api/redlines', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              procId,
              blockId,
              dcn,
              originalText,
              newText: description, // Using description as the new text
              description,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create redline');
          }

          const result = await response.json();
          const redline = result.redline;

          // Update current user's UI immediately
          setRedlines((prev) => [...prev, redline]);

          // Broadcast via socket to other users
          const socket = getSocket();
          if (socket) {
            // notify other users
            socket.emit('redline:create', { room, redline });
          }

          // Call the original callback if provided
          onRedlineSave?.(dcn, description, originalText, blockId);
        } catch (error) {
          console.error('Failed to create redline:', error);
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
      onRedlineClick: (originalText: string) =>
        handleRedlineClick(originalText, blockId),
    };

    // If no redlines, just return with the handler attached
    const blockRedlines = redlines.filter((r) => r.blockId === blockId);
    if (blockRedlines.length === 0) {
      return { ...block, props: baseProps };
    }

    // Apply the latest redline metadata
    const latestRedline = blockRedlines.reduce((latest, current) =>
      new Date(current.createdAt) > new Date(latest.createdAt)
        ? current
        : latest,
    );

    return {
      ...block,
      props: {
        ...baseProps,
        isRedlined: true,
        redlineContent: latestRedline.newText,
        redlineDcn: latestRedline.dcn,
        redlineDescription: latestRedline.description,
        originalContent: latestRedline.originalText,
        author: latestRedline.userId,
        createdAt: latestRedline.createdAt,
      },
    };
  };

  // Build modified data safely (even if content is undefined)
  const modifiedData = {
    ...data,
    content: (data.content ?? []).map((block) => applyRedlinesToBlock(block)),
  };

  // Create a modified data object that applies redlines and injects onRedlineClick

  return (
    <>
      <PuckRender config={config} data={modifiedData} />

      <RedLineModal
        loading={false}
        originalText={redlineState.originalText}
        dcn={redlineState.dcn}
        description={redlineState.description}
        handleCloseRedlineModal={handleCloseRedlineModal}
        handleSaveRedlineModal={handleSaveRedlineModal}
        setDcn={(dcn: string) => setRedlineState((prev) => ({ ...prev, dcn }))}
        setDescription={(description: string) =>
          setRedlineState((prev) => ({ ...prev, description }))
        }
        showRedlineModal={redlineState.isOpen}
      />
    </>
  );
};
