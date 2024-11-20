import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { anchoredReducers } from '../reducers/anchoredReducers';
import type { CommentAnchor } from '../types';
import { PositionedSelectionRange, Positions } from '../types';
import { calculatePositions } from '../utils/calculatePositions';

export type AnchoredState = {
  contentSectionOffsetY: number;
  commentSectionOffsetY: number;
  activeCommentId: string | null;
  textPositions: Positions; // Positions of text anchors in ContentView
  commentHeights: Record<string, number>; // Heights of CommentViews
  selection: PositionedSelectionRange | null; // Represents current selection in ContentSection
  selectionSpansMultipleContents: boolean;
  newComment: {
    id: string;
    selectionRange: PositionedSelectionRange;
    height?: number;
  } | null;
  anchors: CommentAnchor[];
  disabled: boolean;
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
        selectionSpansMultipleContents?: boolean;
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
  | { type: 'ADD_ANCHOR'; payload: CommentAnchor }
  | { type: 'DELETE_ANCHOR'; payload: { id: string } }
  | { type: 'SET_ANCHORS'; payload: CommentAnchor[] }
  | { type: 'SET_DISABLED'; payload: boolean };

type AnchoredCommentsContextType = {
  state: AnchoredState;
  dispatch: React.Dispatch<AnchoredAction>;
  contentViews: React.MutableRefObject<
    Partial<Record<string, React.RefObject<HTMLDivElement>>>
  >;
  // Adjusted positions for CommentViews in CommentSection.
  // Since commentPositions depends on DOM measurements, we'll manage them separate from the main state
  commentPositions: Positions;
  settings: {
    highlight: {
      color: string;
      activeColor: string;
      paddingY: string;
    };
    commentOverlapGap: number;
    addCommentIconPositionRight: string;
  };
};

const AnchoredCommentsContext =
  createContext<AnchoredCommentsContextType | null>(null);

type RenderPropFn = (props: {
  selectionSpansMultipleContents: boolean;
}) => ReactNode;

export const AnchoredCommentsProvider = ({
  anchors,
  children,
  settings = {},
  disabled = false,
}: {
  anchors: CommentAnchor[];
  children: ReactNode | RenderPropFn;
  settings?: {
    highlight?: {
      color?: string;
      activeColor?: string;
      paddingY?: string;
    };
    commentOverlapGap?: number;
    addCommentIconPositionRight?: string;
  };
  disabled?: boolean;
}) => {
  const defaultSettings = {
    highlight: {
      color: '#fef2cd',
      activeColor: '#fcbc03',
      paddingY: '1.2px',
    },
    commentOverlapGap: 10,
    addCommentIconPositionRight: '-3.5rem',
  };

  const mergedSettings = {
    ...defaultSettings,
    ...settings,
    highlight: {
      ...defaultSettings.highlight,
      ...settings.highlight,
    },
  };

  const [state, dispatch] = useReducer(anchoredReducers, {
    contentSectionOffsetY: 0,
    commentSectionOffsetY: 0,
    activeCommentId: null,
    textPositions: {},
    commentHeights: {},
    selection: null,
    selectionSpansMultipleContents: false,
    newComment: null,
    anchors,
    disabled,
  });

  const contentViews = useRef<
    Partial<Record<string, React.RefObject<HTMLDivElement>>>
  >({});

  const [commentPositions, setCommentPositions] = useState<Positions>(
    {},
  );

  useEffect(() => {
    dispatch({ type: 'SET_ANCHORS', payload: anchors });
  }, [
    anchors
      .map(a => a.id)
      .sort((a, b) => a.localeCompare(b))
      .join(','),
  ]);

  useEffect(() => {
    const textPositionsWithNewComment = {
      ...state.textPositions,
      ...(state.newComment && {
        [state.newComment.id]: {
          top: state.newComment.selectionRange.positionTop,
        },
      }),
    };

    const visibleComments = new Set([
      ...state.anchors.map(comment => comment.id),
      ...(state.newComment ? [state.newComment.id] : []),
    ]);

    const positions = calculatePositions(
      textPositionsWithNewComment,
      state.activeCommentId,
      visibleComments,
      state.commentHeights,
      mergedSettings.commentOverlapGap,
    );

    setCommentPositions(positions);
  }, [
    state.textPositions,
    state.newComment,
    state.anchors,
    state.activeCommentId,
    state.commentHeights,
  ]);

  useEffect(() => {
    if (disabled)
      dispatch({
        type: 'SET_ACTIVE_COMMENT_AND_SELECTION',
        payload: { activeCommentId: null, selection: null },
      });

    dispatch({ type: 'SET_DISABLED', payload: disabled });
  }, [disabled]);

  return (
    <AnchoredCommentsContext.Provider
      value={{
        state,
        dispatch,
        contentViews,
        commentPositions,
        settings: mergedSettings,
      }}
    >
      {typeof children === 'function'
        ? children({
            selectionSpansMultipleContents:
              state.selectionSpansMultipleContents,
          })
        : children}
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
