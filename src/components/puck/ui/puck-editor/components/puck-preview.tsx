// ui/components/puck-preview.tsx
'use client';

import config from '@/puck.config';
import { formatTimestamp } from '@/lib/utils/dateformat';
import type { PuckPageData } from '@/app/puck/types';
import clsx from 'clsx';
import { forwardRef, useEffect, useState, useMemo } from 'react';
import { RedlineRender } from '@/components/puck/ui/redline/RedlineRender';
import { useUser } from '@/context/UserContext';
import {
  NavigationDrawer,
  NavigationItem,
} from '@/components/puck/ui/NavigationDrawer';
import { NavigationFloatingButton } from '@/components/puck/ui/NavigationFloatingButton';
import { RedlineFloatingButton } from '@/components/puck/ui/redline/RedlineFloatingButton';
import RedlineComment from '@/components/puck/ui/comments/comment';
import { useRedline } from '@/context/RedlineContext';
import { RedlineMarginLabels } from '../../redline/labels/RedlineMarginLabels';
import { Redline } from '@/modules/redlines/models/redline-model';
import { useCompletionStore } from '@/hooks/use-completion-store';

export const PuckPreview = forwardRef<
  HTMLDivElement,
  {
    puckPageData: PuckPageData;
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
    puckPageData,
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

  const completionStore = useCompletionStore();

  // Extract navigation items from the proc data - memoized to prevent unnecessary recalculations
  const navigationItems = useMemo(() => {
    const items: NavigationItem[] = [];

    // Add title as first item
    items.push({
      id: 'title',
      label: title,
      type: 'title' as const,
    });

    // Extract SectionBlocks, HeadingBlocks, and Completion Blocks from content
    if (puckPageData.content) {
      puckPageData.content.forEach((block, index) => {
        console.log('block: ', block);
        if (block.type === 'SectionBlock' && block.props?.text) {
          items.push({
            id: block.props.id || `section-${index}`,
            label: block.props.text,
            type: 'section',
            completed:
              completionStore.completions[block.props.id]?.completed || false,
          });
        } else if (block.type === 'HeadingBlock' && block.props?.title) {
          items.push({
            id: block.props.id || `heading-${index}`,
            label: block.props.title,
            type: 'heading',
            completed:
              completionStore.completions[block.props.id]?.completed || false,
          });
        } else if (block.type === 'MarkCompleteButton' && block.props?.id) {
          items.push({
            id: block.props.id,
            label: block.props.label || 'Mark Complete',
            type: 'completion',
            completed:
              completionStore.completions[block.props.id]?.completed || false,
            dependencies: block.props.dependencies || [],
          });
        } else if (block.type === 'TaskItemBlock' && block.props?.id) {
          items.push({
            id: block.props.id,
            label: `Task: ${block.props.step || 'Untitled'}`,
            type: 'completion',
            completed:
              completionStore.completions[block.props.id]?.completed || false,
            dependencies: block.props.dependencies || [],
          });
        }
      });
    }
    return items;
  }, [puckPageData.content, completionStore.completions, title]);

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

  const { redlineHoverEnabled, setRedlineHoverEnabled } = useRedline();

  const toggleRedlineHover = () => {
    setRedlineHoverEnabled(!redlineHoverEnabled);
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  // Log navigation items once to verify the fix
  console.log('navigationItems (memoized):', navigationItems);

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
            items={navigationItems}
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
          <RedlineMarginLabels />
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
              data={puckPageData}
              procId={procId}
              room={room}
              redlineHoverEnabled={redlineHoverEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
