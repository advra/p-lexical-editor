'use client';

import { Redline } from '@/modules/redlines/models/redline-model';
import { RedlineCommentsSidebar } from './redline-side-bar/RedlineCommentsSidebar';
import { RedlineMarginLabels } from './RedlineMarginLabels';
import { useRedline } from '@/context/RedlineContext';

type RedlineLayoutWrapperProps = {
  children: React.ReactNode;
  room: string;
  redlines: Redline[];
  onAddComment?: (redlineId: string, comment: string) => void;
  onRedlineDelete?: (redlineId: string) => void;
};

export const RedlineLayoutWrapper = ({
  children,
  room,
  onAddComment,
  onRedlineDelete,
}: RedlineLayoutWrapperProps) => {
  const { selectedRedlineId, closeRedlineSidebar } = useRedline();

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
    <div className="flex">
      {/* Main Content Area (90% width) */}
      <div className="w-9/10">{children}</div>

      {/* Comments Sidebar - Conditionally rendered when redline ID is set */}
      {selectedRedlineId && (
        <RedlineCommentsSidebar
          room={room}
          redlineId={selectedRedlineId}
          onClose={handleCloseSidebar}
          onAddComment={handleAddComment}
          onRedlineDelete={onRedlineDelete}
        />
      )}
    </div>
  );
};
