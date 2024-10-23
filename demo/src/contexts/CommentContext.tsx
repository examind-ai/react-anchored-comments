import { ReactNode } from 'react';
import { createCommentsContext } from 'react-mdnotes';
import type { MessageComment } from '../types';

const { useCommentsContext, CommentsProvider } =
  createCommentsContext<MessageComment>();

export { useCommentsContext };

const CommentsContext = ({
  children,
  initialComments,
}: {
  children: ReactNode;
  initialComments: MessageComment[];
}) => {
  return (
    <CommentsProvider initialComments={initialComments}>
      {children}
    </CommentsProvider>
  );
};

export default CommentsContext;
