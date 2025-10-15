'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface NavigationItem {
  id: string;
  label: string;
  type: 'title' | 'section';
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
            <span className="text-md  text-gray-800">Navigation</span>
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
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'hover:cursor-pointer w-full text-left px-4 py-3 border-l-4 border-transparent transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
                    'hover:font-semibold hover:text-blue-700 hover:border-l-4 hover:border-blue-700',
                    'text-gray-700 hover:text-blue-700',
                    item.type === 'title' && 'font-bold',
                    item.type === 'section' && 'font-semibold',
                  )}
                >
                  {item.label}
                </button>
              ))}
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
