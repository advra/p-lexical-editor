'use client';

import { RedlineProps } from './RedlineComponent';
import { RedlineCommentsSidebar } from './redline-side-bar/RedlineCommentsSidebar';
import { RedlineMarginLabels } from './RedlineMarginLabels';
import { useRedline } from '@/context/RedlineContext';

type RedlineLayoutWrapperProps = {
  children: React.ReactNode;
  redlines: RedlineProps[];
  onAddComment?: (redlineId: string, comment: string) => void;
  onRedlineDelete?: (redlineId: string) => void;
};

export const RedlineLayoutWrapper = ({
  children,
  onAddComment,
  onRedlineDelete,
}: RedlineLayoutWrapperProps) => {
  const { selectedRedlineId, openRedlineSidebar, closeRedlineSidebar } =
    useRedline();

  const handleRedlineClick = (redline: RedlineProps) => {
    // Set the redline ID to open the sidebar
    openRedlineSidebar(redline.dcn);
  };

  const handleCloseSidebar = () => {
    closeRedlineSidebar();
  };

  const handleAddComment =
    onAddComment ||
    ((redlineId: string, comment: string) => {
      console.log('Adding comment to redline:', redlineId, comment);
      // TODO: Implement actual comment addition logic via API
    });

  return (
    <div className="">
      {/* Main Content Area (80% width) */}
      {/* <div className="w-4/5 relative"> */}
      {children}
      {/* Right Margin Area (20% width) */}
      {/* <div className="absolute right-0 top-0 bottom-0 w-1/5 border-l border-gray-200">
          <RedlineMarginLabels
            redlines={redlines}
            onRedlineClick={handleRedlineClick}
          />
        </div>
      </div> */}
      {/* Comments Sidebar - Conditionally rendered when redline ID is set */}
      {selectedRedlineId && (
        <RedlineCommentsSidebar
          redlineId={selectedRedlineId}
          onClose={handleCloseSidebar}
          onAddComment={handleAddComment}
          onRedlineDelete={onRedlineDelete}
        />
      )}
      //{' '}
    </div>
  );
};
