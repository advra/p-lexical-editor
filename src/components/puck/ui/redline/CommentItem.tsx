import { formatTimestamp } from '@/lib/utils/dateformat';
import { Comment } from './RedlineComponent';

type CommentItemProps = {
  comment: Comment;
};

export const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-2">
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-sm text-gray-800">
          {comment.user}
        </span>
        <span className="text-xs text-gray-500">
          {formatTimestamp(comment.createdAt)}
        </span>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap">
        {comment.comment}
      </div>
      {comment.type && (
        <div className="mt-1">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {comment.type}
          </span>
        </div>
      )}
    </div>
  );
};
