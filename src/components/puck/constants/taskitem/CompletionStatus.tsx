import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import UpdateIcon from '@mui/icons-material/Update';
import { useProc } from '@/context/ProcContext';

export default function CompletionStatus({ record, localCompletion }) {
  const { viewMode } = useProc();
  const getUser = () => record?.last_updated_by || 'UNKNOWN';
  const isRedlined = () => record?.isRedlined;
  const isComplete = () => record?.state === 'complete';
  const isLocallyComplete = () => localCompletion?.completed || false;
  const getDCN = () => record?.dcn;

  const lastUpdated = new Date(record?.last_updated || Date.now());
  const localCompletedAt = localCompletion?.completedAt
    ? new Date(localCompletion.completedAt)
    : null;

  const dateStringOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return (
    <Stack direction="column" spacing={1}>
      {isRedlined() && (
        <Stack direction="row" spacing={1} alignItems="center">
          <UpdateIcon fontSize="small" color="info" />
          <Typography variant="body2" color="text.secondary">
            Redlined per DCN {getDCN()} by user ?? on ???
          </Typography>
        </Stack>
      )}
      {isComplete() && (
        <Stack direction="row" spacing={1} alignItems="center">
          <TaskAltIcon fontSize="small" color="success" />
          <Typography variant="body2" color="success.main">
            Marked complete by {getUser()} at {lastUpdated.toLocaleTimeString()}{' '}
            on {lastUpdated.toLocaleDateString('en-US', dateStringOptions)}
          </Typography>
        </Stack>
      )}
      {viewMode === 'view' && isLocallyComplete() && (
        <Stack direction="row" spacing={1} alignItems="center">
          <TaskAltIcon fontSize="small" color="info" />
          <Typography variant="body2" color="info.main">
            Marked complete locally at {localCompletedAt?.toLocaleTimeString()}{' '}
            on{' '}
            {localCompletedAt?.toLocaleDateString('en-US', dateStringOptions)}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
