'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RedlineContextType {
  selectedRedlineId: string | false;
  setSelectedRedlineId: (id: string | false) => void;
  selectedBlockId: string | false;
  setSelectedBlockId: (id: string | false) => void;
  redlineHoverEnabled: boolean;
  setRedlineHoverEnabled: (value: boolean) => void;
  openRedlineSidebar: (redlineId: string) => void;
  closeRedlineSidebar: () => void;
}

const RedlineContext = createContext<RedlineContextType | undefined>(undefined);

interface RedlineProviderProps {
  children: ReactNode;
}

export const RedlineProvider: React.FC<RedlineProviderProps> = ({
  children,
}) => {
  const [selectedRedlineId, setSelectedRedlineId] = useState<string | false>(
    false,
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | false>(false);

  const openRedlineSidebar = (redlineId: string) => {
    setSelectedRedlineId(redlineId);
  };

  const closeRedlineSidebar = () => {
    setSelectedRedlineId(false);
  };

  const [redlineHoverEnabled, setRedlineHoverEnabled] = useState(false);

  const value = {
    selectedRedlineId,
    setSelectedRedlineId,
    selectedBlockId,
    setSelectedBlockId,
    redlineHoverEnabled,
    setRedlineHoverEnabled,
    openRedlineSidebar,
    closeRedlineSidebar,
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
