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
import { Proc } from './ProcsTabbedTable';

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
    setSubmitting(true);
    try {
      await onPermissionsUpdate(proc._id, permissions);
      toast.success('Permissions updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update permissions', error);
      toast.error('Failed to update permissions');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Add User
            </Typography>
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
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Current Permissions
            </Typography>

            {/* Shared users */}
            {permissions.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 3 }}
              >
                No users have been granted permissions yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {permissions.map((userPerm) => (
                  <Box
                    key={userPerm.userId}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        {userPerm.userId}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveUser(userPerm.userId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
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
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Permission Legend */}
          <Box sx={{ bgcolor: 'info.50', borderRadius: 1 }}>
            <div>Permission Types:</div>
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
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
