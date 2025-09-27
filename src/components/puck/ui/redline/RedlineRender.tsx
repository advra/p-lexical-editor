'use client';

import { Render as PuckRender } from '@measured/puck';
import { PuckPageData } from '@/app/puck/types';
import { RedLineModal } from '@/components/redline/RedLineModal';
import { useState } from 'react';

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
  onRedlineSave?: (
    dcn: string,
    description: string,
    originalText: string,
  ) => void;
};

export const RedlineRender = ({
  config,
  data,
  onRedlineSave,
}: RedlineRenderProps) => {
  const [redlineState, setRedlineState] = useState<RedlineState>({
    isOpen: false,
    originalText: '',
    dcn: '',
    description: '',
    onSave: () => {},
  });

  const handleCloseRedlineModal = () => {
    setRedlineState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveRedlineModal = () => {
    redlineState.onSave(redlineState.dcn, redlineState.description);
  };

  const handleRedlineClick = (originalText: string) => {
    setRedlineState({
      isOpen: true,
      originalText,
      dcn: '',
      description: '',
      onSave: (dcn: string, description: string) => {
        onRedlineSave?.(dcn, description, originalText);
        setRedlineState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Create a modified data object that injects onRedlineClick into components
  const modifiedData = {
    ...data,
    content: data.content?.map((item) => ({
      ...item,
      props: {
        ...item.props,
        onRedlineClick: handleRedlineClick,
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
