import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Comment } from '../types';

/*
 * We create a factory function `createCommentContext` to generate a context,
 * provider, and hook that are specific to any type `T` extending `Comment`.
 * This is necessary because React's default `createContext` doesn't support
 * generics in a way that allows for flexible typing with different types `T`.
 * By using this factory pattern, we can maintain type safety and avoid the
 * need for type assertions in consumers, ensuring that our context works
 * seamlessly with various specific comment types.
 *
 * Example usage:
 *
 * // Assuming you have a specific comment type `DetailedComment` that extends `Comment`.
 * interface DetailedComment extends Comment {
 *   author: string;
 *   timestamp: Date;
 * }
 *
 * // Create a context specific to `DetailedComment`.
 * const {
 *   useCommentContext: useDetailedCommentContext,
 *   CommentProvider: DetailedCommentProvider,
 * } = createCommentContext<DetailedComment>();
 *
 * // Use the provider in your app.
 * <DetailedCommentProvider initialComments={initialComments}>
 *   <YourComponent />
 * </DetailedCommentProvider>
 *
 * // Consume the context in your component.
 * const { comments, addComment } = useDetailedCommentContext();
 * // Now `comments` is of type `DetailedComment[]`, and `addComment` accepts a `DetailedComment`.
 */

type CommentContextType<T extends Comment> = {
  comments: T[];
  setComments: React.Dispatch<React.SetStateAction<T[]>>;
  addComment: (comment: T) => void;
  deleteComment: (commentId: string) => void;
};

export type CommentContextReturn<T extends Comment> = {
  useCommentContext: () => CommentContextType<T>;
  CommentProvider: React.FC<{
    children: React.ReactNode;
    initialComments: T[];
  }>;
};

function createCommentContext<
  T extends Comment,
>(): CommentContextReturn<T> {
  const CommentContext = createContext<
    CommentContextType<T> | undefined
  >(undefined);

  const useCommentContext = () => {
    const context = useContext(CommentContext);
    if (context === undefined) {
      throw new Error(
        'useCommentContext must be used within a CommentProvider',
      );
    }
    return context;
  };

  const CommentProvider = ({
    children,
    initialComments,
  }: {
    children: React.ReactNode;
    initialComments: T[];
  }) => {
    const [comments, setComments] = useState<T[]>(initialComments);

    const addComment = useCallback(
      (comment: T) => {
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
      <CommentContext.Provider value={value}>
        {children}
      </CommentContext.Provider>
    );
  };

  return { useCommentContext, CommentProvider };
}

export { createCommentContext };
