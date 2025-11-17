import { RedlineComment, Comment } from './RedlineComponent';

// Mock comments for demonstration
export const mockComments: Comment[] = [
  {
    id: '1',
    type: 'suggestion',
    user: 'John Doe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comment: 'This change looks good, but we should also consider updating the network configuration.',
  },
  {
    id: '2',
    type: 'question',
    user: 'Jane Smith',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    comment: 'What was the reason for changing this parameter?',
  },
  {
    id: '3',
    type: 'general',
    user: 'Mike Johnson',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    comment: 'I agree with the proposed changes.',
  },
];

export const mockRedlineComments: RedlineComment[] = [
  {
    redlineId: 'redline-1',
    DCN: 'DCN-001',
    User: 'Alice Brown',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: mockComments,
  },
  {
    redlineId: 'redline-2',
    DCN: 'DCN-002',
    User: 'Bob Wilson',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    comments: [
      {
        id: '4',
        type: 'suggestion',
        user: 'Sarah Davis',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
        comment: 'This needs more testing before implementation.',
      },
    ],
  },
];

// Helper function to find redline comment by redline ID
export const findRedlineComment = (redlineId: string): RedlineComment | null => {
  return mockRedlineComments.find(rc => rc.redlineId === redlineId) || null;
};

// Helper function to add a comment to a redline
export const addCommentToRedline = (redlineId: string, commentText: string, user: string = 'Current User'): Comment => {
  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    type: 'general',
    user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comment: commentText,
  };

  const redlineComment = mockRedlineComments.find(rc => rc.redlineId === redlineId);
  if (redlineComment) {
    redlineComment.comments.push(newComment);
    redlineComment.updatedAt = new Date().toISOString();
  }

  return newComment;
};
