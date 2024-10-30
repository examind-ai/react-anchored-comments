import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { MessageComment } from '../types';

const CommentsContext = createContext<
  | {
      comments: MessageComment[];
      addComment: (comment: MessageComment) => void;
      deleteComment: (id: string) => void;
      setComments: React.Dispatch<
        React.SetStateAction<MessageComment[]>
      >;
    }
  | undefined
>(undefined);

const CommentsProvider = ({
  initialComments,
  children,
}: {
  initialComments: MessageComment[];
  children: ReactNode;
}) => {
  const [comments, setComments] =
    useState<MessageComment[]>(initialComments);

  const addComment = useCallback(
    (comment: MessageComment) => {
      setComments(prevComments => [...prevComments, comment]);
    },
    [setComments],
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      setComments(prevComments =>
        prevComments.filter(c => c.id !== commentId),
      );
    },
    [setComments],
  );

  const value = useMemo(
    () => ({
      comments,
      setComments,
      addComment,
      deleteComment,
    }),
    [comments, setComments, addComment, deleteComment],
  );

  return (
    <CommentsContext.Provider value={value}>
      {children}
    </CommentsContext.Provider>
  );
};

const useCommentsContext = () => {
  const context = useContext(CommentsContext);
  if (context === undefined) {
    throw new Error(
      'useCommentsContext must be used within a CommentsProvider',
    );
  }
  return context;
};

export { CommentsProvider, useCommentsContext };
