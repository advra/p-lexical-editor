// ui/components/puck-preview.tsx
'use client';

import config from '@/puck.config';
import { formatTimestamp } from '@/lib/utils/dateformat';
import type { PuckPageData } from '@/app/puck/types';
import clsx from 'clsx';
import { forwardRef, useEffect, useState } from 'react';
import { RedlineRender } from '@/components/puck/ui/redline/RedlineRender';
import useUser from '@/hooks/use-user';
import { NavigationDrawer } from '@/components/puck/ui/NavigationDrawer';
import { NavigationFloatingButton } from '@/components/puck/ui/NavigationFloatingButton';
import { RedlineFloatingButton } from '@/components/puck/ui/redline/RedlineFloatingButton';
import { toast } from 'sonner';
import RedlineComment from '@/components/puck/ui/comments/comment';

export const PuckPreview = forwardRef<
  HTMLDivElement,
  {
    data: PuckPageData;
    printPreview?: boolean; // screen vs print-preview
    page?: 'letter' | 'a4';
    owner: string;
    updatedAt: string;
    procId: string;
    room: string;
    onRedlineCreated?: (redline: any) => void;
    title?: string; // Add title prop
  }
>(function PuckPreview(
  {
    data,
    printPreview = false,
    page = 'letter',
    owner,
    updatedAt,
    procId,
    room,
    onRedlineCreated,
    title = 'Title', // Default title
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

  // Extract SectionBlocks from the proc data
  const extractNavigationBlocks = () => {
    const navigationItems = [];

    // Add title as first item
    navigationItems.push({
      id: 'title',
      label: title,
      type: 'title' as const,
    });

    // Extract SectionBlocks and HeadingBlocks from content
    if (data.content) {
      data.content.forEach((block, index) => {
        if (block.type === 'SectionBlock' && block.props?.title) {
          navigationItems.push({
            id: block.props.id || `section-${index}`,
            label: block.props.title,
            type: 'section' as const,
          });
        } else if (block.type === 'HeadingBlock' && block.props?.title) {
          navigationItems.push({
            id: block.props.id || `heading-${index}`,
            label: block.props.title,
            type: 'heading' as const,
          });
        }
      });
    }
    console.log('navigationItems', navigationItems);
    return navigationItems;
  };

  const handleNavigationItemClick = (item: any) => {
    if (item.id === 'title') {
      // Scroll to the top of the document
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to the specific section by its block ID for section and heading elements
      const navElement = document.getElementById(item.id);
      if (navElement) {
        navElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const [redlineHoverEnabled, setRedlineHoverEnabled] = useState(false);

  const toggleRedlineHover = () => {
    if (redlineHoverEnabled) {
      toast('Redline Mode Disabled');
    } else {
      toast('Redline Mode Enabled');
    }
    setRedlineHoverEnabled(!redlineHoverEnabled);
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    extractNavigationBlocks();
  }, [data]);

  return (
    // Show the printable version or actual proc page
    <div>
      {/* Navigation Drawer and Floating Button - Only show in non-preview mode */}
      {!printPreview && (
        <>
          <div className="flex flex-col gap-2 fixed left-4 top-1/2 transform -translate-y-1/2 z-30">
            <NavigationFloatingButton
              onClick={handleDrawerOpen}
              isOpen={isDrawerOpen}
            />
            <RedlineFloatingButton
              onClick={toggleRedlineHover}
              redlineEnabled={redlineHoverEnabled}
            />
          </div>
          <NavigationDrawer
            isOpen={isDrawerOpen}
            onClose={handleDrawerClose}
            onItemClick={handleNavigationItemClick}
            items={extractNavigationBlocks()}
          />
        </>
      )}

      <div className="flex">
        <div
          ref={ref}
          id="printable"
          className={clsx(
            'bg-white',
            printPreview
              ? clsx(
                  size,
                  'mx-auto',
                  'print:w-auto print:min-h-0 print:p-0 print:shadow-none print:my-0',
                )
              : 'mt-24 px-4 mx-auto container my-6 shadow',
          )}
        >
          <div className="flex flex-col">
            <span className="flex gap-1 ml-auto text-sm text-gray-400">
              <span> Created By: {owner}</span>
              {user.session?.user.username === owner && <span>(You)</span>}
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
              redlineHoverEnabled={redlineHoverEnabled}
            />
          </div>
        </div>
        {/* <aside className="no-print hidden lg:flex mt-24 w-72 h-[calc(100vh-6rem)] overflow-y-auto border-l bg-card/60 backdrop-blur px-4 py-3">
          <RedlineComment />
        </aside> */}
      </div>
    </div>
  );
});
