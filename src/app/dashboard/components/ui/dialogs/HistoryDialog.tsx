'use client';

import React, { useState, useEffect } from 'react';
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

import { formatTimestamp } from '@/lib/utils/dateformat';
import { Proc } from '../ProcsTabbedTable';

export type UserPermission = {
  userId: string;
  permissions: {
    read: boolean;
    edit: boolean;
    execute: boolean;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  proc: Proc;
};

enum HistoryType {
  CREATED = 'Created',
  PUBLISHED = 'Published',
  EXECUTED = 'Executed',
}

type VersionHistory = {
  historyType: HistoryType;
  timestampAt: string; // ISO string timestamp
  user?: string;
};

export default function HistoryDialog({ open, onClose, proc }: Props) {
  // temp for mocked data
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const [history] = useState<VersionHistory[]>([
    // Created at the proc's actual createdAt
    {
      historyType: HistoryType.CREATED,
      timestampAt: formatTimestamp(new Date(proc.createdAt)),
      user: proc.owner,
    },
    // Published an hour ago
    {
      historyType: HistoryType.PUBLISHED,
      timestampAt: formatTimestamp(oneHourAgo),
      user: proc.owner,
    },
    // Executed now
    {
      historyType: HistoryType.EXECUTED,
      timestampAt: formatTimestamp(now),
      user: proc.owner,
    },
  ]);

  const displayLabel = (t: HistoryType) => {
    if (t === HistoryType.CREATED) {
      return (
        <>
          <AddCircleIcon />
          Created
        </>
      );
    } else if (t === HistoryType.PUBLISHED) {
      return (
        <>
          <AssignmentTurnedInIcon />
          Published
        </>
      );
    } else if (t === HistoryType.EXECUTED) {
      return (
        <>
          <ElectricBoltIcon />
          Executed
        </>
      );
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
    >
      <DialogTitle id="view-proc-history">
        Procedure History - {proc.data?.root?.props?.title ?? proc.name}
      </DialogTitle>

      <DialogContent>
        <div className="flex flex-col gap-2 mt-2">
          {history.length === 0 ? (
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
            <div className="flex flex-col gap-2 max-h-64">
              {history.map((item: VersionHistory) => (
                <div className="flex items-center gap-2 border border-gray-300 rounded-sm px-4 py-2">
                  <div className="mr-auto">
                    <div className="flex gap-2">
                      {displayLabel(item.historyType)} by {item.user}
                    </div>
                  </div>
                  <div>{item.timestampAt}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={false}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
