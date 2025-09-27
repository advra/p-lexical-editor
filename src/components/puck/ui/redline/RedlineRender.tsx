'use client';

import { Render as PuckRender } from '@measured/puck';
import { PuckPageData } from '@/app/puck/types';
import { RedLineModal } from '@/components/redline/RedLineModal';
import { useState } from 'react';
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

          // Broadcast via socket to other users
          const socket = getSocket();
          if (socket) {
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

  // Create a modified data object that injects onRedlineClick into components with blockId
  const modifiedData = {
    ...data,
    content: data.content?.map((block) => ({
      ...block,
      props: {
        ...block.props,
        onRedlineClick: (originalText: string) =>
          handleRedlineClick(originalText, block.props?.id),
      },
    })),
  };

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
