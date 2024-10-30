import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
  useRef,
  useState,
} from 'react';
import { anchoredReducers } from '../reducers/anchoredReducers';
import type { Comment } from '../types';
import { PositionedSelectionRange, Positions } from '../types';
import { calculatePositions } from '../utils/calculatePositions';

export type AnchoredState = {
  contentSectionOffsetY: number;
  commentSectionOffsetY: number;
  activeCommentId: string | null;
  textPositions: Positions; // Positions of text anchors in ContentView
  commentHeights: Record<string, number>; // Heights of CommentViews
  selection: PositionedSelectionRange | null; // Represents current selection in ContentSection
  newComment: {
    id: string;
    selectionRange: PositionedSelectionRange;
    height?: number;
  } | null;
  comments: Comment[];
};

export type AnchoredAction =
  | { type: 'SET_ACTIVE_COMMENT_ID'; payload: string | null }
  | {
      type: 'SET_SELECTION';
      payload: PositionedSelectionRange | null;
    }
  | {
      type: 'SET_ACTIVE_COMMENT_AND_SELECTION';
      payload: {
        activeCommentId: string | null;
        selection: PositionedSelectionRange | null;
      };
    }
  | { type: 'SHOW_NEW_COMMENT' }
  | { type: 'CANCEL_NEW_COMMENT' }
  | {
      type: 'UPDATE_COMMENT_HEIGHT';
      payload: { id: string; height: number };
    }
  | {
      type: 'UPDATE_TEXT_POSITIONS';
      payload: Record<string, { top: number }>;
    }
  | { type: 'UPDATE_CONTENT_SECTION_OFFSETY'; payload: number }
  | { type: 'UPDATE_COMMENT_SECTION_OFFSETY'; payload: number }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'DELETE_COMMENT'; payload: { id: string } };

type AnchoredCommentsContextType = {
  state: AnchoredState;
  dispatch: React.Dispatch<AnchoredAction>;
  contentViews: React.MutableRefObject<
    Partial<Record<string, React.RefObject<HTMLDivElement>>>
  >;
  // Adjusted positions for CommentViews in CommentSection.
  // Since commentPositions depends on DOM measurements, we'll manage them separate from the main state
  commentPositions: Positions;
  recalculatePositions: () => void;
};

const AnchoredCommentsContext =
  createContext<AnchoredCommentsContextType | null>(null);

export const AnchoredCommentsProvider = ({
  initialComments,
  children,
}: {
  initialComments: Comment[];
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(anchoredReducers, {
    contentSectionOffsetY: 0,
    commentSectionOffsetY: 0,
    activeCommentId: null,
    textPositions: {},
    commentHeights: {},
    selection: null,
    newComment: null,
    comments: initialComments,
  });

  const contentViews = useRef<
    Partial<Record<string, React.RefObject<HTMLDivElement>>>
  >({});

  const [commentPositions, setCommentPositions] = useState<Positions>(
    {},
  );

  const recalculatePositions = useCallback(() => {
    const textPositionsWithNewComment = {
      ...state.textPositions,
      ...(state.newComment && {
        [state.newComment.id]: {
          top: state.newComment.selectionRange.positionTop,
        },
      }),
    };

    const visibleComments = new Set([
      ...state.comments.map(comment => comment.id),
      ...(state.newComment ? [state.newComment.id] : []),
    ]);

    const positions = calculatePositions(
      textPositionsWithNewComment,
      state.activeCommentId,
      visibleComments,
      state.commentHeights,
    );

    setCommentPositions(positions);
  }, [state]);

  return (
    <AnchoredCommentsContext.Provider
      value={{
        state,
        dispatch,
        contentViews,
        commentPositions,
        recalculatePositions,
      }}
    >
      {children}
    </AnchoredCommentsContext.Provider>
  );
};

export const useAnchoredCommentsContext = () => {
  const context = useContext(AnchoredCommentsContext);
  if (!context) {
    throw new Error(
      'useAnchoredCommentsContext must be used within a AnchoredCommentsProvider',
    );
  }
  return context;
};
