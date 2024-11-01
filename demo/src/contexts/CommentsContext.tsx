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
      editComment: (id: string, content: string) => void;
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

  const editComment = useCallback(
    (commentId: string, content: string) => {
      setComments(prevComments => {
        const index = prevComments.findIndex(c => c.id === commentId);
        if (index === -1) return prevComments;

        const prevComment = prevComments[index];

        return [
          ...prevComments.slice(0, index),
          { ...prevComment, content },
          ...prevComments.slice(index + 1),
        ];
      });
    },
    [setComments],
  );

  const value = useMemo(
    () => ({
      comments,
      addComment,
      deleteComment,
      editComment,
    }),
    [comments, editComment, addComment, deleteComment],
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
