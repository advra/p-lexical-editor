import React, { useState, MouseEvent } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreHoriz';
import { useRedline } from '@/context/RedlineContext';

/*
  Options more menu for the redline thread. Users can open to view options such as
    - delete the redline thread
    - or proc author to accept suggestion etc
*/

type Props = {
  isRedlineOwner: boolean;
  deleteRedlineCallback: () => void;
  editRedlineCallback: () => void;
};

function MoreButton({
  isRedlineOwner,
  deleteRedlineCallback,
  editRedlineCallback,
}: Props) {
  // const { setRedlineModalState } = useRedline();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);
  const menuId = 'redline-more-menu';

  const handleOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      {/* Button */}
      <IconButton
        color="inherit"
        aria-label="More actions"
        aria-controls={isOpen ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : undefined}
        size="small"
        onClick={handleOpen}
      >
        <MoreVertIcon />
      </IconButton>

      {/* Menu */}
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          className="flex gap-2"
          onClick={editRedlineCallback}
          disabled={!isRedlineOwner}
        >
          Edit
        </MenuItem>
        <MenuItem
          className="flex gap-2"
          onClick={deleteRedlineCallback}
          disabled={!isRedlineOwner}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export default MoreButton;
