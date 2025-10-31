'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import EditIcon from '@mui/icons-material/Edit';

import { formatTimestamp } from '@/lib/utils/dateformat';
import { Proc } from '../ProcsTabbedTable';

type Props = {
  open: boolean;
  onClose: () => void;
  proc: Proc;
};

enum HistoryType {
  CREATED = 'Created',
  PUBLISHED = 'Published',
  EXECUTED = 'Executed',
  EDITED = 'Edited',
}

type VersionHistory = {
  historyType: HistoryType;
  timestampAt: string; // for display
  timestampMs: number; // for sorting
  user?: string;
};

export default function HistoryDialog({ open, onClose, proc }: Props) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  const [history] = useState<VersionHistory[]>([
    {
      historyType: HistoryType.CREATED,
      timestampAt: formatTimestamp(new Date(proc.createdAt)),
      timestampMs: new Date(proc.createdAt).getTime(),
      user: 'Steve',
    },
    {
      historyType: HistoryType.PUBLISHED,
      timestampAt: formatTimestamp(oneHourAgo),
      timestampMs: oneHourAgo.getTime(),
      user: 'Adrian',
    },
    {
      historyType: HistoryType.EXECUTED,
      timestampAt: formatTimestamp(now),
      timestampMs: now.getTime(),
      user: 'Steve',
    },
    {
      historyType: HistoryType.EDITED,
      timestampAt: formatTimestamp(twoHoursAgo),
      timestampMs: twoHoursAgo.getTime(),
      user: 'Steve',
    },
    {
      historyType: HistoryType.EDITED,
      timestampAt: formatTimestamp(fiveHoursAgo),
      timestampMs: fiveHoursAgo.getTime(),
      user: 'Adrian',
    },
  ]);

  // newest first (optional)
  const items = [...history].sort((a, b) => b.timestampMs - a.timestampMs);

  const iconFor = (t: HistoryType) => {
    switch (t) {
      case HistoryType.CREATED:
        return <AddCircleIcon fontSize="small" />;
      case HistoryType.PUBLISHED:
        return <AssignmentTurnedInIcon fontSize="small" />;
      case HistoryType.EXECUTED:
        return <ElectricBoltIcon fontSize="small" />;
      case HistoryType.EDITED:
        return <EditIcon fontSize="small" />;
    }
  };

  const bubbleBg = (t: HistoryType) => {
    switch (t) {
      case HistoryType.CREATED:
        return 'bg-blue-600';
      case HistoryType.PUBLISHED:
        return 'bg-green-500';
      case HistoryType.EXECUTED:
        return 'bg-amber-500';
      case HistoryType.EDITED:
        return 'bg-blue-500';
    }
  };

  return (
    <Dialog
      className="max-h-30vh"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="view-proc-history"
      fullScreen
    >
      <DialogTitle id="view-proc-history">
        Procedure History — {proc.data?.root?.props?.title ?? proc.name}
      </DialogTitle>

      <DialogContent className="mt-4">
        {items.length === 0 ? (
          <div className="max-h-64 border border-gray-300 rounded-sm px-4 py-2">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 3 }}
            >
              There is no other history for this Procedure
            </Typography>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {/* Center the whole timeline in the dialog */}
            <div className="mx-auto w-full max-w-3xl px-2 sm:px-4">
              <ul className="flex flex-col gap-4">
                {items.map((item, idx) => {
                  const isLast = idx === items.length - 1;
                  return (
                    <li
                      key={`${item.historyType}-${item.timestampAt}-${idx}`}
                      className="grid grid-cols-[1fr,auto,1fr] items-stretch gap-x-4"
                    >
                      {/* Center rail: bubble + dashed connector that fills row height */}
                      <div className="col-start-2 flex flex-col items-center h-full">
                        <div
                          className={[
                            'z-10 w-9 h-9 rounded-full text-white grid place-items-center shadow-md',
                            bubbleBg(item.historyType),
                          ].join(' ')}
                        >
                          {iconFor(item.historyType)}
                        </div>
                        {!isLast && (
                          <div className="mt-2 flex-1 w-0 border-l-2 border-dashed border-gray-300 dark:border-gray-600" />
                        )}
                      </div>

                      {/* Right-side content (uniform height + neat alignment) */}
                      <div className="col-start-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-white/5 p-3 shadow-sm min-h-12 flex items-center">
                        <div className="w-full grid grid-cols-[auto,1fr,auto] gap-3">
                          <span className="font-medium whitespace-nowrap">
                            {item.historyType} by {item.user}
                          </span>
                          <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums">
                            {item.timestampAt}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
