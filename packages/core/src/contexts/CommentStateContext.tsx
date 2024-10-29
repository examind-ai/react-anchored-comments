import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
  useRef,
  useState,
} from 'react';
import { commentReducer } from '../reducers/commentReducer';
import type { Comment } from '../types';
import { PositionedSelectionRange, Positions } from '../types';
import { calculatePositions } from '../utils/calculatePositions';

export type CommentState = {
  commentableSectionOffsetY: number;
  commentsSectionOffsetY: number;
  activeCommentId: string | null;
  textPositions: Positions; // Positions of text anchors in CommentableSection
  commentHeights: Record<string, number>; // Heights of comment boxes
  selection: PositionedSelectionRange | null; // Represents current selection in CommentableSection
  newComment: {
    id: string;
    selectionRange: PositionedSelectionRange;
    height?: number;
  } | null;
  comments: Comment[];
};

export type CommentAction =
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
  | { type: 'SHOW_NEW_COMMENT_BOX' }
  | { type: 'CANCEL_NEW_COMMENT' }
  | {
      type: 'UPDATE_COMMENT_HEIGHT';
      payload: { id: string; height: number };
    }
  | {
      type: 'UPDATE_TEXT_POSITIONS';
      payload: Record<string, { top: number }>;
    }
  | { type: 'UPDATE_COMMENTABLE_SECTION_OFFSETY'; payload: number }
  | { type: 'UPDATE_COMMENTS_SECTION_OFFSETY'; payload: number }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'DELETE_COMMENT'; payload: { id: string } };

type CommentStateContextType = {
  state: CommentState;
  dispatch: React.Dispatch<CommentAction>;
  commentableContainers: React.MutableRefObject<
    Partial<Record<string, React.RefObject<HTMLDivElement>>>
  >;
  // Adjusted positions for comment boxes in CommentsSection.
  // Since commentPositions depends on DOM measurements, we'll manage them separate from the main state
  commentPositions: Positions;
  recalculatePositions: () => void;
};

const CommentStateContext =
  createContext<CommentStateContextType | null>(null);

export const CommentStateProvider = ({
  initialComments,
  children,
}: {
  initialComments: Comment[];
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(commentReducer, {
    commentableSectionOffsetY: 0,
    commentsSectionOffsetY: 0,
    activeCommentId: null,
    textPositions: {},
    commentHeights: {},
    selection: null,
    newComment: null,
    comments: initialComments,
  });

  const commentableContainers = useRef<
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
    <CommentStateContext.Provider
      value={{
        state,
        dispatch,
        commentableContainers,
        commentPositions,
        recalculatePositions,
      }}
    >
      {children}
    </CommentStateContext.Provider>
  );
};

export const useCommentStateContext = () => {
  const context = useContext(CommentStateContext);
  if (!context) {
    throw new Error(
      'useCommentStateContext must be used within a CommentStateProvider',
    );
  }
  return context;
};
