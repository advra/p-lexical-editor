// ui/components/puck-preview.tsx
'use client';

import { Render } from '@measured/puck';
import config from '@/puck.config';
import { formatTimestamp } from '@/lib/utils/dateformat';
import type { PuckPageData } from '@/app/puck/types';
import clsx from 'clsx';
import { forwardRef, useState } from 'react';
import { RedlineRender } from '@/components/puck/ui/redline/RedlineRender';
import useUser from '@/hooks/use-user';
import { NavigationDrawer } from '@/components/puck/ui/NavigationDrawer';
import { NavigationFloatingButton } from '@/components/puck/ui/NavigationFloatingButton';

export const PuckPreview = forwardRef<
  HTMLDivElement,
  {
    data: PuckPageData;
    preview?: boolean; // screen vs print-preview
    page?: 'letter' | 'a4';
    owner: string;
    updatedAt: string;
    procId: string;
    room: string;
    onRedlineCreated?: (redline: any) => void;
  }
>(function PuckPreview(
  {
    data,
    preview = false,
    page = 'letter',
    owner,
    updatedAt,
    procId,
    room,
    onRedlineCreated,
  },
  ref,
) {
  const user = useUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const size =
    page === 'a4'
      ? 'w-[210mm] min-h-[297mm] p-[12mm]'
      : 'w-[8.5in] min-h-[11in] p-[0.5in]';

  const handleRedlineSave = (
    dcn: string,
    description: string,
    originalText: string,
  ) => {
    console.log('Redline saved:', { dcn, description, originalText });
    // Here you would typically save the redline data to your backend
    // For now, we'll just log it
  };

  const handleNavigationItemClick = (item: any) => {
    if (item.id === 'title') {
      // Scroll to the top of the document
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // For sections, we'll need to implement finding the section by ID
      // For now, just scroll to a reasonable position
      const sectionElement = document.querySelector(
        `[data-section="${item.id}"]`,
      );
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback: scroll to approximate position based on section number
        const sectionNum = parseInt(item.id.split('-')[1]);
        const scrollPosition = sectionNum * 500; // Adjust this multiplier as needed
        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }
    }
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    // Show the printable version or actual proc page
    <div>
      {/* Navigation Drawer and Floating Button - Only show in non-preview mode */}
      {!preview && (
        <>
          <NavigationFloatingButton
            onClick={handleDrawerOpen}
            isOpen={isDrawerOpen}
          />
          <NavigationDrawer
            isOpen={isDrawerOpen}
            onClose={handleDrawerClose}
            onItemClick={handleNavigationItemClick}
          />
        </>
      )}

      <div
        ref={ref}
        id="printable"
        className={clsx(
          'bg-white',
          preview
            ? clsx(
                size,
                'mx-auto',
                'print:w-auto print:min-h-0 print:p-0 print:shadow-none print:my-0',
              )
            : 'mt-24 px-4 mx-auto max-w-6xl my-6 shadow',
        )}
      >
        <div className="flex flex-col">
          <span className="flex gap-2 ml-auto text-sm text-gray-400">
            Created By: {owner}
            {user.session?.user.username === owner && <>(You)</>}
          </span>
          <span className="ml-auto text-sm text-gray-400">
            Last Updated: {formatTimestamp(updatedAt)}
          </span>
        </div>

        {/* inner wrapper is constant */}
        <div className="min-h-screen">
          <RedlineRender
            config={config}
            data={data}
            procId={procId}
            room={room}
            onRedlineSave={handleRedlineSave}
          />
        </div>
      </div>
    </div>
  );
});
