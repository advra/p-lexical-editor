'use client';

/*
  This component dynamically builds out the navigtion menu based on the contents of the page

  It parses data and displays blocks tagged as Header and Sections
  Each contain a completion checkmark based on whether as Task Item is completed
*/

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { useCompletionStore } from '@/hooks/use-completion-store';

export interface NavigationItem {
  id: string;
  label: string;
  type: 'title' | 'section' | 'heading' | 'completion';
  completed?: boolean;
  requiresPreviousComplete?: boolean;
  dependencies?: string[];
}

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items?: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
}

export const NavigationDrawer = ({
  isOpen,
  onClose,
  items = [],
  onItemClick,
}: NavigationDrawerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { completions } = useCompletionStore();

  console.log('completions ALL: ', completions);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleItemClick = (item: NavigationItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
    onClose();
  };

  if (!isVisible && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-md  text-gray-800">Page Navigation</span>
            <button
              onClick={onClose}
              className="p-2 hover:cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-2">
              {/* Add Title */}
              <button
                key={items[0].id}
                onClick={() => handleItemClick(items[0])}
                className={cn(
                  'hover:cursor-pointer w-full text-left px-4 py-3 border-l-4 border-transparent transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
                  'hover:font-semibold hover:text-blue-700 hover:border-l-4 hover:border-blue-700',
                  'text-gray-700 hover:text-blue-700 font-bold',
                )}
              >
                <div className="items-center">{items[0].label}</div>
              </button>
              {items.map((item) => {
                if (item.type !== 'title')
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        'hover:cursor-pointer w-full text-left px-4 py-3 border-l-4 border-transparent transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
                        'hover:border-l-4 hover:border-blue-700',
                        'text-gray-700 hover:text-blue-700',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {item.type !== 'completion' && (
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        )}
                        <div
                          className={cn(
                            item.type === 'heading' && 'font-semibold ml-2',
                            item.type === 'section' && 'font-normal ml-4',
                            item.type === 'completion' && 'ml-6 text-sm',
                          )}
                        >
                          {item.label}
                        </div>
                        {item.completed === true && (
                          <TaskAltIcon
                            fontSize="small"
                            className="ml-auto text-green-500"
                          />
                        )}
                        {item.completed === false && (
                          <PanoramaFishEyeIcon
                            fontSize="small"
                            className="ml-auto text-gray-300"
                          />
                        )}
                      </div>
                    </button>
                  );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Click on items to navigate to sections
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
