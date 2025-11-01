'use client';

import { useState, useEffect } from 'react';
import { RedlineComment } from './RedlineComponent';
import { CommentItem } from './CommentItem';
import { formatTimestamp } from '@/lib/utils/dateformat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { findRedlineComment } from './mockRedlineData';
import { useTRPC } from '@/trpc/client';
import { useProc } from '@/context/ProcContext';
import { useRedline } from '@/context/RedlineContext';
import { useQuery } from '@tanstack/react-query';

type RedlineCommentsSidebarProps = {
  redlineId: string;
  onClose: () => void;
  onAddComment: (redlineId: string, comment: string) => void;
};

export const RedlineCommentsSidebar = ({
  redlineId,
  onClose,
  onAddComment,
}: RedlineCommentsSidebarProps) => {
  const trpc = useTRPC();
  const { procId } = useProc();
  const { selectedRedlineId, selectedBlockId } = useRedline();
  const [newComment, setNewComment] = useState('');
  const [redlineComment, setRedlineComment] = useState<RedlineComment | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Use TRPC query to fetch the redline data
  const { data: redlineData, isLoading } = useQuery(
    trpc.redlines.getByRedlineId.queryOptions({
      procId: procId,
      blockId: selectedBlockId,
      redlineId: selectedRedlineId,
    }),
  );

  useEffect(() => {
    console.log('redlinn redlineID', selectedRedlineId);
    console.log('redlinn blockID', selectedBlockId);
  }, [selectedBlockId, selectedRedlineId]);

  // Fetch redline comments when sidebar opens
  useEffect(() => {
    const fetchRedlineComments = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        console.log('Fetching comments for redline:', redlineId);
        const commentData = findRedlineComment(redlineId);
        setRedlineComment(commentData);
      } catch (error) {
        console.error('Error fetching redline comments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (redlineId) {
      fetchRedlineComments();
    }
  }, [redlineId]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(redlineId, newComment.trim());
      setNewComment('');
      // TODO: Refresh comments after adding
      // For now, we'll just log and let the parent handle the update
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (isLoading || loading) {
    return (
      <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Close sidebar"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading comments...</div>
        </div>
      </div>
    );
  }

  if (!redlineData) {
    return (
      <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Redline Thread</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Close sidebar"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <p>Redline not found</p>
            <p className="text-sm mt-1">ID: {redlineId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-800">Redline Thread</h3>
          <div className="flex flex-col text-sm text-gray-600">
            <span>DCN: {redlineData.dcn}</span>
            <span>Created By {redlineData.userId}</span>
            <span className="text-xs">
              {formatTimestamp(redlineData.createdAt)}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Close sidebar"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
      <div className="p-4">{redlineData.newText}</div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4">
        {redlineData.comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No comments yet</p>
            <p className="text-sm mt-1">Be the first to add a comment</p>
          </div>
        ) : (
          redlineData.comments.map((comment) => (
            // <CommentItem key={comment.id} comment={comment} />
            <>PLACEHOLDER</>
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
