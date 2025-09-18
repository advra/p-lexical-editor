'use client';
import * as React from 'react';
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';

import LogoutButton from '../buttons/LogoutButton';
import LoginButton from '../buttons/LoginButton';
import SettingsButton from '../buttons/SettingButton';

type Props = {
  username: string | null;
  avatarUrl?: string | null;
  size?: number; // px
};

export default function ProfileAvatarMenu({
  username,
  avatarUrl,
  size = 36,
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const initials = (name?: string | null) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return (
      (parts[0]?.[0] ?? '').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase()
    );
  };

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block text-sm leading-none">
        Welcome <span className="font-semibold">{username ?? 'Guest'}</span>!
      </div>

      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-controls={open ? 'profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          src={avatarUrl ?? undefined}
          alt={username ?? 'Avatar Icon'}
          sx={{ width: size, height: size }}
        >
          {initials(username)}
        </Avatar>
      </IconButton>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        {username
          ? [
              <MenuItem
                key="settings"
                onClick={() => {
                  setAnchorEl(null);
                  router.push('/settings'); // no need to await
                }}
              >
                <SettingsButton handleClose={() => setAnchorEl(null)} />
              </MenuItem>,
              <MenuItem key="logout">
                <LogoutButton handleClose={() => setAnchorEl(null)} />
              </MenuItem>,
            ]
          : [
              <MenuItem key="login">
                <LoginButton handleClose={() => setAnchorEl(null)} />
              </MenuItem>,
            ]}
      </Menu>
    </div>
  );
}
