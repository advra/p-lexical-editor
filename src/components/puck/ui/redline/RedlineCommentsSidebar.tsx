'use client';

import { useState } from 'react';
import { RedlineComment } from './RedlineComponent';
import { CommentItem } from './CommentItem';
import { formatTimestamp } from '@/lib/utils/dateformat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

type RedlineCommentsSidebarProps = {
  redlineComment: RedlineComment | null;
  onClose: () => void;
  onAddComment: (redlineId: string, comment: string) => void;
};

export const RedlineCommentsSidebar = ({
  redlineComment,
  onClose,
  onAddComment,
}: RedlineCommentsSidebarProps) => {
  const [newComment, setNewComment] = useState('');

  if (!redlineComment) {
    return null;
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(redlineComment.redlineId, newComment.trim());
      setNewComment('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-800">
            DCN {redlineComment.DCN}
          </h3>
          <p className="text-sm text-gray-600">
            by {redlineComment.User} •{' '}
            {formatTimestamp(redlineComment.createdAt)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Close sidebar"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4">
        {redlineComment.comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No comments yet</p>
            <p className="text-sm mt-1">Be the first to add a comment</p>
          </div>
        ) : (
          redlineComment.comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a comment..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="self-end bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Send comment"
          >
            <SendIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
};
