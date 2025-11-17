import { formatTimestamp } from '@/lib/utils/dateformat';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils/cn';

type Props = {
  dcn?: string;
  description?: string;
  author?: string;
  createdAt?: string;
  target?: string;
  redlineId?: string;
  onRedlineDelete?: (redlineId: string) => void;
};

export const RedlineInfo = ({
  dcn,
  description,
  author,
  createdAt,
  target,
  redlineId,
  onRedlineDelete,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const { session } = useUser();
  const targetDisplay = target ? ` (${target})` : '';

  const isAuthor = session?.user?.username === author;

  const handleDelete = async () => {
    if (!redlineId || !onRedlineDelete) {
      console.error('Missing redlineId or onRedlineDelete callback');
      return;
    }

    if (!isAuthor) {
      console.error('User is not authorized to delete this redline');
      return;
    }

    setLoading(true);
    try {
      onRedlineDelete(redlineId);
    } catch (error) {
      console.error('Failed to delete redline:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-left mt-1 p-2 text-sm flex items-center">
        <HistoryIcon fontSize="small" color="info" className="align-middle" />
        <span className="mx-2 flex-1">
          Per DCN {dcn} {targetDisplay}: {description} by {author} on{' '}
          {createdAt && formatTimestamp(createdAt)}
        </span>
        {isAuthor && (
          <IconButton
            size="small"
            onClick={handleDelete}
            disabled={loading}
            title="Delete Redline"
          >
            <DeleteIcon
              fontSize="small"
              className="text-red-500 hover:text-red-700"
            />
          </IconButton>
        )}
      </div>
    </>
  );
};
