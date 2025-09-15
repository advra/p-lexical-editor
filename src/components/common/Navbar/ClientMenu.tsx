'use client';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/navigation';
import LogoutButton from '../buttons/LogoutButton';
import LoginButton from '../buttons/LoginButton';

export default function ClientMenu({ username }: { username: string | null }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  return (
    <div>
      <div className="text-sm flex items-center gap-1 min-w-32">
        <span onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)} className="hover:cursor-pointer">
          Welcome {username ?? 'Guest'}!
        </span>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <ExpandMoreIcon fontSize="small" className={open ? 'rotate-180' : ''} />
        </IconButton>

        <Menu
          anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}
          slotProps={{
            paper: {
              sx: { minWidth: 200 },
            },
          }}
        >
          {username ?
            <>
              <MenuItem onClick={async () => { setAnchorEl(null); await router.push('/settings'); }}>Settings</MenuItem>
              <LogoutButton handleClose={() => setAnchorEl(null)} />
            </> : <>
              <LoginButton handleClose={() => setAnchorEl(null)} />
            </>}
        </Menu>
      </div>
    </div>
  );
}
