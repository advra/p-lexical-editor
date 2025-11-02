'use client';

import { useState, useEffect, useCallback } from 'react';
import { RedlineComment } from '../RedlineComponent';
import { CommentItem } from '../CommentItem';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import { formatTimestamp } from '@/lib/utils/dateformat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { findRedlineComment } from '../mockRedlineData';
import { useTRPC } from '@/trpc/client';
import { useProc } from '@/context/ProcContext';
import { useRedline } from '@/context/RedlineContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Redline } from '@/modules/redlines/models/redline-model';
import MoreButton from './Cards/MoreButton';

type RedlineCommentsSidebarProps = {
  room: string;
  redlineId: string;
  onClose: () => void;
  onAddComment: (redlineId: string, comment: string) => void;
  onRedlineDelete?: (redlineId: string) => void;
};

export const RedlineCommentsSidebar = ({
  room,
  redlineId,
  onClose,
  onAddComment,
  onRedlineDelete,
}: RedlineCommentsSidebarProps) => {
  const trpc = useTRPC();
  const { procId } = useProc();
  const { openRedlineModal } = useRedline();
  const { selectedRedlineId, selectedBlockId } = useRedline();
  const [redline, setRedline] = useState<Redline | null>(null);
  const [newComment, setNewComment] = useState('');
  const [redlineComment, setRedlineComment] = useState<RedlineComment | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  // TODO get user permissions
  const isAuthor = true;

  // Use TRPC query to fetch the redline data
  const { data: redlineData, isLoading } = useQuery(
    trpc.redlines.getByRedlineId.queryOptions({
      procId: procId,
      blockId: selectedBlockId,
      redlineId: selectedRedlineId,
    }),
  );

  const autoResizeTextarea = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 240) + 'px'; // 120px max height
  };

  const {
    mutate: deleteMutate,
    isPending: deletePending,
    isError: deleteHasError,
  } = useMutation(trpc.redlines.delete.mutationOptions());

  const handleDelete = useCallback(() => {
    if (redline && onRedlineDelete) {
      onRedlineDelete(redline.redlineId);
      onClose(); // Close the sidebar after deletion
    }
  }, [redline, onRedlineDelete, onClose]);

  const handleEdit = useCallback(() => {
    if (selectedBlockId && redline) {
      const modalData = {
        redline: redline,
        originalText: redline.originalText,
        target: redline.target,
      };
      openRedlineModal(room, procId, selectedBlockId, modalData);
    }
    onClose();
  }, [selectedBlockId, redline, procId, openRedlineModal, onClose]);

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

  // Update redline state when redlineData changes
  useEffect(() => {
    if (redlineData) {
      setRedline(redlineData);
    }
  }, [redlineData]);

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
      <div className="fixed right-0 top-0 h-screen w-[32rem] bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
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
      <div className="fixed right-0 top-0 h-screen w-[32rem] bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Redline Discussion</h3>
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
    <div className="fixed right-0 top-0 h-screen w-[32rem] bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-800">Redline Discussion</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Close sidebar"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
      <span className="px-4 pt-2 ml-auto text-sm text-gray-500">
        {formatTimestamp(redlineData.createdAt)}
      </span>
      <div className="flex flex-col m-2 p-4 rounded-md border border-gray-200">
        <div className="flex text-sm ">
          <span className="flex gap-1">
            <HistoryIcon
              fontSize="small"
              color="info"
              className="align-middle"
            />
            <span className="font-semibold text-black">DCN:</span>{' '}
            {redlineData.dcn}
          </span>
        </div>
        <div className="text-sm ">
          <span className="font-semibold ">Author: </span>
          <span>{redlineData.userId}</span>
        </div>
        <div>{redlineData.newText}</div>
        <div className="ml-auto">
          <MoreButton
            deleteRedlineCallback={handleDelete}
            isRedlineOwner={isAuthor}
            editRedlineCallback={handleEdit}
          />
        </div>
      </div>

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
        <div className="flex gap-2 min-h-10 max-h-64 overflow-y-auto">
          <textarea
            value={newComment}
            // onChange={(e) => setNewComment(e.target.value)}
            onChange={(e) => {
              setNewComment(e.target.value);
              autoResizeTextarea(e.target);
            }}
            // onKeyPress={handleKeyPress}
            placeholder="Add a comment..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-0 "
            rows={1}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="self-end bg-transparent text-gray-500 p-2 rounded-lg hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Send comment"
          >
            <SendIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
};
