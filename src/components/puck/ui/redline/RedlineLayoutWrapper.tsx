'use client';

import { useState } from 'react';
import { RedlineProps, RedlineComment } from './RedlineComponent';
import { RedlineCommentsSidebar } from './RedlineCommentsSidebar';
import { RedlineMarginLabels } from './RedlineMarginLabels';
import { findRedlineComment, addCommentToRedline } from './mockRedlineData';

type RedlineLayoutWrapperProps = {
  children: React.ReactNode;
  redlines: RedlineProps[];
};

export const RedlineLayoutWrapper = ({
  children,
  redlines,
}: RedlineLayoutWrapperProps) => {
  const [selectedRedline, setSelectedRedline] = useState<RedlineComment | null>(
    null,
  );

  const handleRedlineClick = (redline: RedlineProps) => {
    // Find the corresponding redline comment data
    const redlineComment = findRedlineComment(redline.dcn);
    setSelectedRedline(redlineComment);
  };

  const handleAddComment = (redlineId: string, comment: string) => {
    // Add comment to the mock data
    addCommentToRedline(redlineId, comment);

    // Update the selected redline to show the new comment
    const updatedRedlineComment = findRedlineComment(redlineId);
    setSelectedRedline(updatedRedlineComment);
  };

  const handleCloseSidebar = () => {
    setSelectedRedline(null);
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content Area (80% width) */}
      <div className="w-4/5 relative">
        {children}

        {/* Right Margin Area (20% width) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/5 border-l border-gray-200">
          <RedlineMarginLabels
            redlines={redlines}
            onRedlineClick={handleRedlineClick}
          />
        </div>
      </div>

      {/* Comments Sidebar */}
      <RedlineCommentsSidebar
        redlineComment={selectedRedline}
        onClose={handleCloseSidebar}
        onAddComment={handleAddComment}
      />
    </div>
  );
};
