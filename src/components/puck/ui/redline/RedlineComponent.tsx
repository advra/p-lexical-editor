/*
  This is an abstract component which adds Redline capability to any Puck Component by extending it
*/

import { RedlineWrapper } from './RedlineWrapper';

export type RedlineProps = {
  isRedlined?: boolean;
  dcn: string;
  userId: string;
  originalText: string;
  newText: string;
  createdAt: string;
};

export type AddRedlineProps = {
  onRedlineClick?: (originalText: string, blockId?: string) => void;
  redlinesByTarget?: { [target: string]: RedlineProps };
};

type Props = {
  onRedlineClick?: (originalText: string, blockId?: string) => void;
  handleMenuClose?: () => void;
  children?: React.ReactNode;
  blockId?: string;
};

// Higher Order Component that wraps any component with redline capabilities
export const withRedline = <P extends object>(
  Component: React.ComponentType<P & Props>,
) => {
  return (props: P & Props) => {
    const { onRedlineClick, handleMenuClose, ...componentProps } = props;

    return (
      <Component
        {...(componentProps as P)}
        onRedlineClick={onRedlineClick}
        handleMenuClose={handleMenuClose}
      />
    );
  };
};

// Hook for using redline functionality
export const useRedline = (
  onRedlineClick?: (originalText: string, blockId?: string) => void,
  handleMenuClose?: () => void,
  blockId?: string,
) => {
  const handleOpenRedlineModal = (originalText: string) => {
    if (onRedlineClick) {
      onRedlineClick(originalText, blockId);
    }
    if (handleMenuClose) {
      handleMenuClose();
    }
  };

  return {
    handleOpenRedlineModal,
    RedlineWrapper: ({ children, onClick, ...props }: any) => (
      <RedlineWrapper
        {...props}
        onClick={(e) => {
          if (onClick) onClick(e);
          // Extract text content from the element
          const textContent =
            typeof children === 'string'
              ? children
              : e.currentTarget.textContent || '';
          handleOpenRedlineModal(textContent);
        }}
      >
        {children}
      </RedlineWrapper>
    ),
  };
};

// Base component that can be extended
export const RedlineComponent = ({ children }: Props) => {
  return children || null;
};

/* 
  Function that can be used directly in components
*/
export const redlineOptions = (
  onRedlineClick?: (originalText: string, target?: string) => void,
  handleMenuClose?: () => void,
) => {
  const handleOpenRedlineModal = (
    originalText: string,
    target: string = 'content',
  ) => {
    if (onRedlineClick) {
      onRedlineClick(originalText, target);
    }
    if (handleMenuClose) {
      handleMenuClose();
    }
  };

  return handleOpenRedlineModal;
};
