'use client';

import { RedlineProps } from './RedlineComponent';

type RedlineMarginLabelsProps = {
  redlines: RedlineProps[];
  onRedlineClick: (redline: RedlineProps) => void;
};

export const RedlineMarginLabels = ({
  redlines,
  onRedlineClick,
}: RedlineMarginLabelsProps) => {
  return (
    <div className="relative">
      {redlines.map((redline) => (
        <button
          key={redline.dcn}
          onClick={() => onRedlineClick(redline)}
          className="absolute right-0 transform -translate-y-1/2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer shadow-sm"
          style={{ top: '50%' }}
          title={`DCN ${redline.dcn} - Click to view comments`}
        >
          {redline.dcn}
        </button>
      ))}
    </div>
  );
};
