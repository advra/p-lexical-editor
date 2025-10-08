'use client';

import { useState, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NearMeIcon from '@mui/icons-material/NearMe';
import NearMeDisabledIcon from '@mui/icons-material/NearMeDisabled';
import { toast } from 'sonner';

type Props = {
  isPublished: boolean | null;
  path: string; // e.g. "/procs/abc123"
  onPublish?: (slug: string) => void | Promise<void>;
  onUnpublish?: (slug: string) => void | Promise<void>;
};

export const MoreButton = ({
  isPublished,
  path,
  onPublish,
  onUnpublish,
}: Props) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleEdit = () => {
    handleClose();
    router.push(`${path}/edit`);
  };

  const handleUnpublish = async () => {
    handleClose();
    try {
      await onUnpublish?.(path);
      toast.success('Successfully unpublished and saved to drafts');
    } catch (e) {
      console.error('Publish failed:', e);
    }
  };

  const handlePublish = async () => {
    handleClose();
    try {
      await onPublish?.(path);
      toast.success('Your Proc Published Successfully!');
    } catch (e) {
      console.error('Publish failed:', e);
    }
  };

  const menuId = 'more-menu';

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="More actions"
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        size="large"
        onClick={handleOpen}
      >
        <MoreHorizIcon />
        {/* Or <MoreVertIcon /> */}
      </IconButton>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon className="text-amber-600" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        {/* TODO: Implement drafts for publish and unpublish */}
        {isPublished ? (
          <MenuItem onClick={handleUnpublish}>
            <ListItemIcon>
              <NearMeDisabledIcon className="text-green-600" />
            </ListItemIcon>
            <ListItemText>Unpublish</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handlePublish}>
            <ListItemIcon>
              <NearMeIcon className="text-green-600" />
            </ListItemIcon>
            <ListItemText>Publish</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
