import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { usePuck } from '@puckeditor/core';

type Props = {
  handleInsertComponent: (key: string, location: 'above' | 'below') => void;
  /** Ref to the trigger button element, used for positioning the portal */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  /** Callback to close the menu */
  onClose: () => void;
};

function InsertComponentToolbarPopupMenu({
  handleInsertComponent,
  triggerRef,
  onClose,
}: Readonly<Props>) {
  const puck = usePuck();
  const puckConfig = puck.config;
  const puckComponents = puckConfig.components || {};
  const puckComponentKeys = Object.keys(puckComponents);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Position the menu below the trigger button
  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [triggerRef]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  const menu = (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 2147483647, // max safe z-index
      }}
      className="bg-white border border-gray-300 rounded shadow-lg p-1 min-w-[140px]"
    >
      {/* Above Current */}
      <div className="relative group">
        <div className="cursor-pointer px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between">
          <span>Above Current</span>
          <KeyboardArrowRightIcon className="!text-[15px] text-gray-500" />
        </div>
        <div className="absolute left-full top-0 ml-0.5 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg p-1 min-w-[140px] z-[2147483647]">
          {puckComponentKeys.map((key) => {
            const component = puckComponents[key];
            const label = (component as { label?: string })?.label || key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleInsertComponent(key, 'above')}
                className="cursor-pointer block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Below Current */}
      <div className="relative group">
        <div className="cursor-pointer px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between">
          <span>Below Current</span>
          <KeyboardArrowRightIcon className="!text-[15px] text-gray-500" />
        </div>
        <div className="absolute left-full top-0 ml-0.5 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg p-1 min-w-[140px] z-[2147483647]">
          {puckComponentKeys.map((key) => {
            const component = puckComponents[key];
            const label = (component as { label?: string })?.label || key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleInsertComponent(key, 'below')}
                className="cursor-pointer block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render into document body to break out of any stacking context
  return createPortal(menu, document.body);
}

export default InsertComponentToolbarPopupMenu;

