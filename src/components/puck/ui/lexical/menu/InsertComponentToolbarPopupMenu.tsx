import React from 'react';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { usePuck } from '@puckeditor/core';

type Props = {
  handleInsertComponent: (key: string, location: 'above' | 'below') => void;
};

function InsertComponentToolbarPopupMenu({
  handleInsertComponent,
}: Readonly<Props>) {
  const puck = usePuck();
  const puckConfig = puck.config;
  const puckComponents = puckConfig.components || {};
  const puckComponentKeys = Object.keys(puckComponents);

  return (
    <div className="absolute top-full left-0 mt-1 z-100000 bg-white border border-gray-300 rounded shadow-lg p-1 min-w-[140px]">
      {/* Above Current */}
      <div className="relative group">
        <div className="cursor-pointer px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between">
          <span>Above Current</span>
          <KeyboardArrowRightIcon className="!text-[15px] text-gray-500" />
        </div>
        <div className="absolute left-full top-0 ml-0.5 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg p-1 min-w-[140px] z-50">
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
          <span>Below Current </span>
          <KeyboardArrowRightIcon className="!text-[15px] text-gray-500" />
        </div>
        <div className="absolute left-full top-0 ml-0.5 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg p-1 min-w-[140px] z-50">
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
}

export default InsertComponentToolbarPopupMenu;
