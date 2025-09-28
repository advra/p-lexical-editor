import { formatTimestamp } from '@/lib/utils/dateformat';
import HistoryIcon from '@mui/icons-material/History';

type Props = {
  dcn?: string;
  description?: string;
  author?: string;
  createdAt?: string;
};

export const RedlineInfo = ({ dcn, description, author, createdAt }: Props) => {
  return (
    <>
      <div className="text-left mt-1 p-2 text-sm align-middle">
        <HistoryIcon fontSize="small" color="info" />
        <span className="mx-2">Redlined per DCN {dcn}:</span>
        <span>
          {description} by {author} on {createdAt && formatTimestamp(createdAt)}
        </span>
      </div>
    </>
  );
};
