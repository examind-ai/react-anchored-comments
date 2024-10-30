import { ReactNode } from 'react';
import { createCommentContext } from 'react-anchored-comments';
import type { MessageComment } from '../types';

const { useCommentContext, CommentProvider } =
  createCommentContext<MessageComment>();

export { useCommentContext };

const CommentsContext = ({
  children,
  initialComments,
}: {
  children: ReactNode;
  initialComments: MessageComment[];
}) => {
  return (
    <CommentProvider initialComments={initialComments}>
      {children}
    </CommentProvider>
  );
};

export default CommentsContext;
