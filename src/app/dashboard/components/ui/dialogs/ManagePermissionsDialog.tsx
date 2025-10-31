'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'sonner';
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
  onPermissionsUpdate: (
    procId: string,
    permissions: UserPermission[],
  ) => Promise<void>;
};

export default function ManagePermissionsDialog({
  open,
  onClose,
  proc,
  onPermissionsUpdate,
}: Props) {
  const [newUserId, setNewUserId] = useState('');
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Initialize permissions from proc data
  useEffect(() => {
    if (open && proc) {
      // TODO: Replace with actual permissions data from proc once backend is updated
      // For now, initialize with empty array
      setPermissions([]);
    }
  }, [open, proc]);

  const handleAddUser = () => {
    const userId = newUserId.trim();
    if (!userId) {
      toast.error('Please enter a user ID');
      return;
    }

    if (permissions.some((p) => p.userId === userId)) {
      toast.error('User already added');
      return;
    }

    setPermissions((prev) => [
      ...prev,
      {
        userId,
        permissions: {
          read: true,
          edit: false,
          execute: false,
        },
      },
    ]);
    setNewUserId('');
  };

  const handleRemoveUser = (userId: string) => {
    setPermissions((prev) => prev.filter((p) => p.userId !== userId));
  };

  const handlePermissionChange = (
    userId: string,
    permission: keyof UserPermission['permissions'],
    value: boolean,
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.userId === userId
          ? {
              ...p,
              permissions: {
                ...p.permissions,
                [permission]: value,
              },
            }
          : p,
      ),
    );
  };

  const handleSave = async () => {
    // setSubmitting(true);
    // try {
    //   await onPermissionsUpdate(proc._id, permissions);
    //   toast.success('Permissions updated successfully');
    //   onClose();
    // } catch (error) {
    //   console.error('Failed to update permissions', error);
    //   toast.error('Failed to update permissions');
    // } finally {
    //   setSubmitting(false);
    // }
  };

  return (
    <Dialog
      className="max-h-30vh"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="manage-permissions-title"
    >
      <DialogTitle id="manage-permissions-title">
        Manage Permissions - {proc.data?.root?.props?.title ?? proc.name}
      </DialogTitle>

      <DialogContent>
        <div className="my-4">
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              label="Enter User ID"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="Enter user ID or email"
              fullWidth
              size="small"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddUser();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddUser}
              disabled={!newUserId.trim()}
            >
              <AddIcon />
            </Button>
          </Box>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <Typography variant="h6" gutterBottom>
            Group Permissions
          </Typography>

          <div className="flex items-center border border-gray-300 rounded-sm px-4 py-2">
            <div className="mr-auto">All Users</div>
            <FormControlLabel control={<Checkbox />} label="Read" />
            <FormControlLabel control={<Checkbox />} label="Edit" />
            <FormControlLabel control={<Checkbox />} label="Execute" />
            <IconButton size="small" disabled>
              <DeleteIcon />
            </IconButton>
          </div>
          {/* Shared users */}
          <Typography variant="h6" gutterBottom>
            Individual Permissions
          </Typography>
          <div className="overflow-y-scroll">
            {permissions.length === 0 ? (
              <div className="max-h-64 border border-gray-300 rounded-sm px-4 py-2">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 3 }}
                >
                  No users have been granted permissions yet
                </Typography>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-64">
                {permissions.map((userPerm) => (
                  <div className="flex items-center border border-gray-300 rounded-sm px-4 py-2">
                    <div className="mr-auto">{userPerm.userId}</div>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={userPerm.permissions.read}
                          onChange={(e) =>
                            handlePermissionChange(
                              userPerm.userId,
                              'read',
                              e.target.checked,
                            )
                          }
                        />
                      }
                      label="Read"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={userPerm.permissions.edit}
                          onChange={(e) =>
                            handlePermissionChange(
                              userPerm.userId,
                              'edit',
                              e.target.checked,
                            )
                          }
                        />
                      }
                      label="Edit"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={userPerm.permissions.execute}
                          onChange={(e) =>
                            handlePermissionChange(
                              userPerm.userId,
                              'execute',
                              e.target.checked,
                            )
                          }
                        />
                      }
                      label="Execute"
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveUser(userPerm.userId)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Permission Legend */}
        <span className="text-lg">Permission Types:</span>
        <div className="py-2 text-xs">
          <div>
            <div>
              • <strong>Read:</strong> View the procedure
            </div>
            <div>
              • <strong>Edit:</strong> Modify the procedure content
            </div>
            <div>
              • <strong>Execute:</strong> Mark tasks as complete during
              execution
            </div>
          </div>
        </div>

        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
