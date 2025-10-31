'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const eventSeed: Array<{
    type: HistoryType;
    user: string;
    offsetMin: number;
  }> = [
    { type: HistoryType.EXECUTED, user: 'Adrian', offsetMin: 0 }, // now
    // { type: HistoryType.EDITED, user: 'Steve', offsetMin: 5 },
    { type: HistoryType.PUBLISHED, user: 'Adrian', offsetMin: 12 },
    // { type: HistoryType.EDITED, user: 'Steve', offsetMin: 25 },
    { type: HistoryType.EXECUTED, user: 'Adrian', offsetMin: 40 },
    // { type: HistoryType.EDITED, user: 'Steve', offsetMin: 60 }, // 1h
    { type: HistoryType.PUBLISHED, user: 'Adrian', offsetMin: 75 },
    // { type: HistoryType.EDITED, user: 'Steve', offsetMin: 90 },
    { type: HistoryType.EXECUTED, user: 'Adrian', offsetMin: 120 }, // 2h
    // { type: HistoryType.EDITED, user: 'Adrian', offsetMin: 150 },
    { type: HistoryType.PUBLISHED, user: 'Steve', offsetMin: 180 }, // 3h
    // { type: HistoryType.EDITED, user: 'Adrian', offsetMin: 240 }, // 4h
    { type: HistoryType.EXECUTED, user: 'Steve', offsetMin: 300 }, // 5h
    // { type: HistoryType.EDITED, user: 'Adrian', offsetMin: 360 }, // 6h
    { type: HistoryType.PUBLISHED, user: 'Steve', offsetMin: 480 }, // 8h
    { type: HistoryType.PUBLISHED, user: 'Adrian', offsetMin: 720 }, // 12h
    { type: HistoryType.EXECUTED, user: 'Steve', offsetMin: 1440 }, // 1 day
    { type: HistoryType.PUBLISHED, user: 'Adrian', offsetMin: 2880 }, // 2 days
    { type: HistoryType.PUBLISHED, user: 'Steve', offsetMin: 4320 }, // 3 days
  ];
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  const [history] = useState<VersionHistory[]>(() => {
    const base = [
      {
        historyType: HistoryType.CREATED,
        timestampAt: formatTimestamp(new Date(proc.createdAt)),
        timestampMs: new Date(proc.createdAt).getTime(),
        user: 'Steve',
      },
    ];

    const seeded = eventSeed.map(({ type, user, offsetMin }) => {
      const ts = new Date(Date.now() - offsetMin * 60_000);
      return {
        historyType: type,
        timestampAt: formatTimestamp(ts),
        timestampMs: ts.getTime(),
        user,
      };
    });

    return [...base, ...seeded];
  });

  // newest first (optional)
  const items = [...history].sort((a, b) => b.timestampMs - a.timestampMs);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  const iconFor = (t: HistoryType) => {
    switch (t) {
      case HistoryType.CREATED:
        return <AddCircleIcon fontSize="small" className="text-blue-600" />;
      case HistoryType.PUBLISHED:
        return (
          <AssignmentTurnedInIcon fontSize="small" className="text-green-500" />
        );
      case HistoryType.EXECUTED:
        return <ElectricBoltIcon fontSize="small" className="text-amber-500" />;
      case HistoryType.EDITED:
        return <EditIcon fontSize="small" className="text-blue-500" />;
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
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'text.secondary',
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle id="view-proc-history">
        History — ({proc.data?.root?.props?.title ?? proc.name} by {proc.owner})
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
          <>
            {/* Floating controls: Arrow Up Down Newest Oldest */}
            <div className="fixed left-3 md:left-6 top-1/2 -translate-y-1/2 z-3">
              <div className="flex flex-col items-center gap-2">
                <span className="pointer-events-none rounded-full text-[11px] px-2 py-1 bg-transparent text-black/90">
                  Newest
                </span>

                <IconButton
                  aria-label="scroll to newest"
                  onClick={scrollToTop}
                  className="bg-black/60 hover:bg-black/70 text-white shadow"
                  size="small"
                  sx={{ padding: 1 }}
                >
                  <KeyboardArrowUpIcon fontSize="small" />
                </IconButton>
                <div className="w-px h-11 bg-black/40" />
                <IconButton
                  aria-label="scroll to oldest"
                  onClick={scrollToBottom}
                  className="bg-black/60 hover:bg-black/70 text-white shadow"
                  size="small"
                  sx={{ padding: 1 }}
                >
                  <KeyboardArrowDownIcon fontSize="small" />
                </IconButton>

                <span className="pointer-events-none rounded-full text-[11px] px-2 py-1 bg-transparent text-black/90">
                  Oldest
                </span>
              </div>
            </div>

            <div ref={scrollRef} className="h-full overflow-auto">
              {/* Center the whole timeline in the dialog */}
              <div className="mx-auto w-full max-w-3xl px-2 sm:px-4">
                <ul className="flex flex-col gap-4">
                  {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    return (
                      <li
                        key={`${item.historyType}-${item.timestampAt}-${idx}`}
                      >
                        {/* Right-side content (uniform height + neat alignment) */}
                        <div className="col-start-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-white/5 p-3 shadow-sm min-h-12 flex items-center">
                          <div className="w-full grid grid-cols-[auto,1fr,auto] gap-3">
                            <span className="flex font-medium whitespace-nowrap">
                              <div>
                                {iconFor(item.historyType)}
                                {item.historyType} by {item.user}
                              </div>
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
                <p className="my-4 w-full text-center text-md text-gray-500">
                  You've reached the bottom
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
