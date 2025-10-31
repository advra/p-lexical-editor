import { Menu, MenuItem } from '@mui/material';
import React from 'react';

type Props = {
  open: boolean;
  anchorEl: null | HTMLElement;
  handleMenuClose: () => void;
  handleManagePermissions: () => void;
};

export default function MoreMenu({
  open,
  anchorEl,
  handleMenuClose,
  handleManagePermissions,
}: Props) {
  const menuOptions = [
    {
      key: 1,
      text: 'Manage Permissions',
      onClick: handleManagePermissions,
    },
    {
      key: 2,
      text: 'View History',
      onClick: () => {},
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
              '0 12px 28px rgba(0,0,0,0.01), 0 2px 6px rgba(0,0,0,0.05)',
            minWidth: 200,
          },
        },
      }}
    >
      {menuOptions.map((menuItem) => (
        <MenuItem key={menuItem.key} onClick={menuItem.onClick}>
          {menuItem.text}
        </MenuItem>
      ))}
    </Menu>
  );
}
