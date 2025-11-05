'use client';

import { useRedline } from '@/context/RedlineContext';
import { Redline } from '@/modules/redlines/models/redline-model';
import { Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

interface LabelPosition {
  dcn: string;
  redlineId: string;
  top: number;
  visible: boolean;
}

type Props = {};

export const RedlineMarginLabels = ({}: Props) => {
  const { redlines, openRedlineSidebar } = useRedline();

  // TODO: Fix this so it is clickable
  // open redline
  const handleRedlineClick = (redline: Redline) => {
    openRedlineSidebar(redline.redlineId);
  };
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);

  // Calculate positions for all redlines based on their block elements
  useEffect(() => {
    const calculatePositions = () => {
      const positions: LabelPosition[] = [];
      const labelHeight = 32; // Approximate height of a label in pixels
      const spacing = 4; // Additional spacing between labels

      // First pass: calculate base positions
      const basePositions: LabelPosition[] = redlines.map((redline) => {
        if (!redline.blockId) {
          return {
            dcn: redline.dcn,
            redlineId: redline.redlineId,
            top: 0,
            visible: false,
          };
        }

        // Try to find the block element by ID
        const blockElement = document.getElementById(redline.blockId);
        if (!blockElement) {
          console.log(
            `RedlineMarginLabels: Block element not found for ID: ${redline.blockId}`,
          );
          return {
            dcn: redline.dcn,
            redlineId: redline.redlineId,
            top: 0,
            visible: false,
          };
        }

        // Get the position of the block element
        const rect = blockElement.getBoundingClientRect();
        const top = rect.top + window.scrollY;

        return {
          dcn: redline.dcn,
          redlineId: redline.redlineId,
          top,
          visible: true,
        };
      });

      // Second pass: resolve collisions by moving overlapping labels down
      const resolvedPositions: LabelPosition[] = [];

      basePositions
        .filter((pos) => pos.visible)
        .sort((a, b) => a.top - b.top) // Sort by top position
        .forEach((position, index) => {
          let adjustedTop = position.top;

          // Check for collisions with previously positioned labels
          for (let i = 0; i < resolvedPositions.length; i++) {
            const existingPos = resolvedPositions[i];
            const distance = Math.abs(adjustedTop - existingPos.top);

            // If labels are too close (overlapping or nearly overlapping)
            if (distance < labelHeight + spacing) {
              // Move current label down by the required amount
              adjustedTop = existingPos.top + labelHeight + spacing;
            }
          }

          resolvedPositions.push({
            ...position,
            top: adjustedTop,
          });
        });

      // Add non-visible positions back
      const nonVisiblePositions = basePositions.filter((pos) => !pos.visible);
      setLabelPositions([...resolvedPositions, ...nonVisiblePositions]);
    };

    // Calculate positions initially
    calculatePositions();

    // Recalculate on scroll and resize
    window.addEventListener('scroll', calculatePositions);
    window.addEventListener('resize', calculatePositions);

    return () => {
      window.removeEventListener('scroll', calculatePositions);
      window.removeEventListener('resize', calculatePositions);
    };
  }, [redlines]);

  return (
    <div className="relative">
      {labelPositions.map((position) => {
        const redline = redlines.find((r) => r.dcn === position.dcn);
        if (!redline || !position.visible) return null;

        return (
          <button
            key={redline.dcn}
            // onClick={() => handleRedlineClick(redline)}
            className="absolute -mt-21 -ml-24 left-0 transform -translate-y-1/2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded border border-red-200  transition-colors z-10"
            style={{ top: `${position.top}px` }}
            title={`DCN ${redline.redlineId} Label`}
          >
            <span className="flex gap-2 items-center">
              DCN: {redline.dcn}
              <svg
                className="w-3 h-3 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {/* SVG Right Arrow */}
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>
        );
      })}
    </div>
  );
};
