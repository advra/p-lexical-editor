'use client';

import { useState, useEffect, useCallback } from 'react';
import { RedlineComment } from '../RedlineComponent';

import CloseIcon from '@mui/icons-material/Close';
import { findRedlineComment } from '../mockRedlineData';
import { useProc } from '@/context/ProcContext';
import { useRedline } from '@/context/RedlineContext';
import { Redline } from '@/modules/redlines/models/redline-model';
import RedlineThreadCard from './Cards/ThreadCard';
import { useUser } from '@/context/UserContext';
import { formatTimestamp } from '@/lib/utils/dateformat';
import { getRedlineById } from '@/lib/redlines-json';

type RedlineCommentsSidebarProps = {
  room: string;
  redlineId: string;
  onClose: () => void;
  onAddComment: (redlineId: string, comment: string) => void;
  onRedlineDelete?: (redlineId: string) => void;
};

const comments: any[] = [
  {
    _id: 'kd23-9ruwej',
    createdAt: '2025-11-02T22:43:27.685Z',
    user: 'Adrian',
    comment:
      'Yes I agree. However, we should also include sfr jeu oaijafasd sfjasew wi fajijfsdijsdafjlkjlksdfji odsfa8dsfsdfsdfh ksdfkjsfdkjfs',
  },
  {
    _id: '2938j-83jd',
    createdAt: '2025-11-02T22:43:27.685Z',
    user: 'Steve',
    comment: 'Concur. Please make the following changes above',
  },
  {
    _id: '2938j-83jd',
    createdAt: '2025-11-02T22:43:27.685Z',
    user: 'Kelli',
    comment:
      'Yes. Also consider the following: x, y z changes. To go with X, Y, Z. Then Also consider the following: nsidAlso consider the following: x, y z changes. To go with X, Y, Z. ThenAlso consider the following: x, y z changes. To go with X, Y, Z. ThenAlso consider the following: x, y z changeAlso consider the following: x, y z changes. To go with X, Y, Z. Thens. To go with X, Y, Z. ThenAlsoAlso consider the following: x, y z changes. To go with X, Y, Z. Then consider the following: x, y z changes. To go with X, Y, Z. Thener the following: x, y z changes. To go with X, Y, Z. Then',
  },
  {
    _id: '2938j-83jd',
    createdAt: '2025-11-02T22:43:27.685Z',
    user: 'Adrian',
    comment: 'Sounds good!',
  },
  {
    _id: '2938j-83jd',
    createdAt: '2025-11-02T22:43:27.685Z',
    user: 'Steve',
    comment:
      'if you can make the changes by today COB I can approve. the changes by today COB I ca the changes by today COB I ca the changes by today COB I ca the changes by today COB I ca',
  },
  {
    _id: '2938j-83jd',
    createdAt: '2025-11-02T22:43:27.685Z',
    user: 'Steve',
    comment:
      'if you can make the changes by today COB I can approve. the changes by today COB I ca the changes by today COB I ca the changes by today COB I ca the changes by today COB I ca',
  },
  {
    _id: '2938j-83jd',
    createdAt: '2025-11-02T22:43:27.685Z',
    user: 'Steve',
    comment:
      'if you can make the changes by today COB I can approve. the changes by today COB I ca the changes by today COB I ca the changes by today COB I ca the changes by today COB I ca',
  },
];

export const RedlineCommentsSidebar = ({
  room,
  redlineId,
  onClose,
  onAddComment,
  onRedlineDelete,
}: RedlineCommentsSidebarProps) => {
  const { user } = useUser();
  const { procId, owner } = useProc();
  const { openRedlineModal } = useRedline();
  const { selectedRedlineId, selectedBlockId } = useRedline();
  const [redline, setRedline] = useState<Redline | null>(null);
  const [newComment, setNewComment] = useState('');
  const [redlineComment, setRedlineComment] = useState<RedlineComment | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  // TODO get user permissions
  const isAuthor = user?.username === owner;

  const autoResizeTextarea = (textarea: EventTarget & HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 240) + 'px'; // 120px max height
  };

  const handleDeleteRedline = useCallback(() => {
    if (redline && onRedlineDelete) {
      onRedlineDelete(redline.redlineId);
      onClose(); // Close the sidebar after deletion
    }
  }, [redline, onRedlineDelete, onClose]);

  const handleEditRedline = useCallback(() => {
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

  // Fetch redline data when sidebar opens
  useEffect(() => {
    const fetchRedlineData = async () => {
      setLoading(true);
      try {
        if (procId && selectedBlockId && selectedRedlineId) {
          const redlineData = getRedlineById(
            procId,
            selectedBlockId,
            selectedRedlineId,
          );
          setRedline(redlineData);

          // Also fetch mock comments for now
          console.log('Fetching comments for redline:', selectedRedlineId);
          const commentData = findRedlineComment(selectedRedlineId);
          setRedlineComment(commentData);
        }
      } catch (error) {
        console.error('Error fetching redline data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (procId && selectedBlockId && selectedRedlineId) {
      fetchRedlineData();
    }
  }, [procId, selectedBlockId, selectedRedlineId]);

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

  if (loading) {
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

  if (!redline) {
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
      {/* Display Redline Thread */}
      <RedlineThreadCard
        redlineData={redline}
        isLoading={loading}
        isAuthor={isAuthor}
        onClose={onClose}
        onDeleteRedline={handleDeleteRedline}
        onEditRedline={handleEditRedline}
      />

      <div className="flex flex-col p-2">
        <div className={`p-4 rounded-lg border border-gray-200 mb-2`}>
          <span className="font-semibold">Redline Details:</span>
          <div className="flex gap-2 items-start mb-1">
            <span className="font-semibold text-gray-800">Created:</span>{' '}
            {formatTimestamp(redline.createdAt.toString())}
          </div>
          <div className="flex gap-2 items-start mb-1">
            <span className="font-semibold text-gray-800">Updated:</span>{' '}
            {formatTimestamp(redline.updatedAt.toString())}
          </div>
          <div className="flex gap-2 items-start mb-1">
            <span className="font-semibold text-gray-800">Amends?:</span> No
          </div>
          <div className="flex gap-2 items-start mb-1">
            <span className="font-semibold text-gray-800">Relates To?:</span>{' '}
            N/A
          </div>
          {/* <div className="text-gray-700 whitespace-pre-wrap">Yes</div> */}
          {/* {comment.type && (
        <div className="mt-1">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {comment.type}
          </span>
        </div>
      )} */}
        </div>
      </div>

      {/* Comments List 
        Comments are moved to their own for the doc not redline specifically*/}
      {/* <div className="flex-1 overflow-y-auto p-2 m-4">
        <span className="my-2 ml-2 text-gray-700">
          Thread Comments ({comments.length} Total):
        </span>

        {
          // redlineData.comments.length === 0 ?
          comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to add a comment</p>
            </div>
          ) : (
            // read from redlineData but for now mock
            // redlineData.comments.map((comment) => (
            //   <CommentItem key={comment.id} comment={comment} />
            // ))
            comments.map((comment, index) => {
              return (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  className=""
                  index={index}
                />
              );
            })
          )
        }
      </div> */}

      {/* Add Comment Input */}
      {/* <div className="border-t border-gray-200 p-4 bg-white">
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
      </div> */}
    </div>
  );
};
