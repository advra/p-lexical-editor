import { formatTimestamp } from '@/lib/utils/dateformat';
import { Comment } from '../../RedlineComponent';

type Props = {
  comment: Comment;
  className: string;
};

export const CommentItem = ({ comment, className }: Props) => {
  return (
    <div className="flex flex-col">
      <span className="ml-auto text-sm text-gray-500">
        {formatTimestamp(comment.createdAt.toString())}
      </span>
      <div className="p-4 rounded-lg border border-gray-200 mb-2">
        <div className="flex justify-between items-start mb-1">
          <span className="font-semibold text-gray-800">{comment.user}</span>
        </div>
        <div className="text-gray-700 whitespace-pre-wrap">
          {comment.comment}
        </div>
        {/* {comment.type && (
        <div className="mt-1">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {comment.type}
          </span>
        </div>
      )} */}
      </div>
    </div>
  );
};
