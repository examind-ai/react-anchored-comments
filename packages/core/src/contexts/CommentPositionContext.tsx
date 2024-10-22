import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { calculatePositions } from '../utils/calculatePositions';
import { useSelectionContext } from './SelectionContext';
import { CommentPositions, CommentSize } from '../types';

type CommentPositionContextType = {
  registerComment: (id: string) => void;
  unregisterComment: (id: string) => void;
  getAdjustedTop: (id: string) => number;
  updateCommentSize: (id: string, size: CommentSize) => void;
};

const CommentPositionContext = createContext<
  CommentPositionContextType | undefined
>(undefined);

export const CommentPositionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [visibleComments, setVisibleComments] = useState<Set<string>>(
    new Set(),
  );
  const [commentSizes, setCommentSizes] = useState<
    Record<string, CommentSize>
  >({});
  const [adjustedPositions, setAdjustedPositions] =
    useState<CommentPositions>({});
  const { commentPositionState } = useSelectionContext();

  // TODO: fix the memoization here - positions get calculated on every render
  const updatePositions = useCallback(() => {
    const newPositions = calculatePositions(
      commentPositionState,
      visibleComments,
      commentSizes,
    );
    setAdjustedPositions(newPositions);
  }, [commentPositionState, visibleComments, commentSizes]);

  useEffect(() => {
    updatePositions();
  }, [updatePositions]);

  const registerComment = useCallback((id: string) => {
    setVisibleComments(prev => new Set(prev).add(id));
  }, []);

  const unregisterComment = useCallback((id: string) => {
    setVisibleComments(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setCommentSizes(prev => {
      const newSizes = { ...prev };
      delete newSizes[id];
      return newSizes;
    });
  }, []);

  const updateCommentSize = useCallback(
    (id: string, size: CommentSize) => {
      setCommentSizes(prev => {
        if (JSON.stringify(prev[id]) !== JSON.stringify(size)) {
          return { ...prev, [id]: size };
        }
        return prev;
      });
    },
    [],
  );

  const getAdjustedTop = useCallback(
    (id: string) =>
      adjustedPositions[id]?.top ??
      commentPositionState.positions[id]?.top ??
      0,
    [adjustedPositions, commentPositionState],
  );

  const contextValue = useMemo(
    () => ({
      registerComment,
      unregisterComment,
      getAdjustedTop,
      updateCommentSize,
    }),
    [
      registerComment,
      unregisterComment,
      getAdjustedTop,
      updateCommentSize,
    ],
  );

  return (
    <CommentPositionContext.Provider value={contextValue}>
      {children}
    </CommentPositionContext.Provider>
  );
};

export const useCommentPositionContext = () => {
  const context = useContext(CommentPositionContext);
  if (!context) {
    throw new Error(
      'useCommentPositionContext must be used within a CommentPositionProvider',
    );
  }
  return context;
};
