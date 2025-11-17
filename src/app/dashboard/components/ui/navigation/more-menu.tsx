import { Menu, MenuItem } from '@mui/material';
import React from 'react';
import HistoryIcon from '@mui/icons-material/History';
import KeyIcon from '@mui/icons-material/Key';

type Props = {
  open: boolean;
  anchorEl: null | HTMLElement;
  handleMenuClose: () => void;
  handleManagePermissions: () => void;
  openHistoryDialog: () => void;
};

export default function MoreMenu({
  open,
  anchorEl,
  handleMenuClose,
  handleManagePermissions,
  openHistoryDialog,
}: Props) {
  const menuOptions = [
    {
      key: 1,
      icon: <KeyIcon />,
      text: 'Manage Permissions',
      onClick: handleManagePermissions,
    },
    {
      key: 2,
      icon: <HistoryIcon />,
      text: 'View History',
      onClick: openHistoryDialog,
    },
  ];
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            boxShadow:
              '0 12px 28px rgba(0,0,0,0.001), 0 2px 6px rgba(0,0,0,0.01)',
            minWidth: 200,
          },
        },
      }}
    >
      {menuOptions.map((menuItem) => (
        <MenuItem key={menuItem.key} onClick={menuItem.onClick}>
          <div className="flex gap-2">
            {menuItem.icon} {menuItem.text}
          </div>
        </MenuItem>
      ))}
    </Menu>
  );
}
