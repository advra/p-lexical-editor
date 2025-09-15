'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation"
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutButton from './buttons/LogoutButton';
import Link from 'next/link';

export const Navbar = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl((prev) => (prev ? null : e.currentTarget));
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <nav className="w-full px-4 py-2 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex items-center">
            <div className="mr-4 font-semibold"><Link href="/toc">EPUCK</Link></div>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm flex items-center gap-1 hover:cursor-pointer hover:underline"
              onClick={handleToggle}>
              <span>Welcome alonzoa!</span>

              <IconButton
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                size="small"
              >
                <ExpandMoreIcon
                  fontSize="small"
                  className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                />
              </IconButton>

              <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    elevation: 1,
                    sx: { minWidth: 200, py: 1 },
                  },
                }}
              >
                {/* <MenuItem onClick={handleClose}>Profile</MenuItem> */}
                <MenuItem
                  onClick={async () => {
                    handleClose();
                    await router.push('/settings');
                  }}
                >
                  Settings
                </MenuItem>
                <LogoutButton handleClose={handleClose} />
              </Menu>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
