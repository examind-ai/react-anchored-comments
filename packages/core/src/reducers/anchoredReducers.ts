import { NEW_COMMENT_ID } from '../constants';
import {
  AnchoredAction,
  AnchoredState,
} from '../contexts/AnchoredCommentsContext';

export const anchoredReducers = (
  state: AnchoredState,
  action: AnchoredAction,
): AnchoredState => {
  switch (action.type) {
    case 'SET_ACTIVE_COMMENT_ID':
      return {
        ...state,
        activeCommentId: action.payload,
      };

    case 'SET_SELECTION':
      return { ...state, selection: action.payload };

    case 'SET_ACTIVE_COMMENT_AND_SELECTION':
      return {
        ...state,
        activeCommentId: action.payload.activeCommentId,
        selection: action.payload.selection,
        // Clear newComment when selection is cleared
        ...(action.payload.selection === null && {
          newComment: null,
        }),
      };

    case 'SHOW_NEW_COMMENT':
      if (!state.selection) return state; // Cannot show new comment without a selection
      return {
        ...state,
        newComment: {
          id: NEW_COMMENT_ID,
          selectionRange: state.selection,
        },
        activeCommentId: 'new',
        selection: null,
      };

    case 'CANCEL_NEW_COMMENT':
      return {
        ...state,
        newComment: null,
        activeCommentId:
          state.activeCommentId === 'new'
            ? null
            : state.activeCommentId,
      };

    case 'UPDATE_COMMENT_HEIGHT':
      return {
        ...state,
        commentHeights: {
          ...state.commentHeights,
          [action.payload.id]: action.payload.height,
        },
      };

    case 'UPDATE_TEXT_POSITIONS':
      return {
        ...state,
        textPositions: action.payload,
      };

    case 'UPDATE_CONTENT_SECTION_OFFSETY':
      return { ...state, contentSectionOffsetY: action.payload };

    case 'UPDATE_COMMENT_SECTION_OFFSETY':
      return { ...state, commentSectionOffsetY: action.payload };

    case 'ADD_ANCHOR':
      return {
        ...state,
        anchors: [...state.anchors, action.payload],
        newComment: null,
        activeCommentId: action.payload.id,
      };

    case 'DELETE_ANCHOR':
      return {
        ...state,
        anchors: state.anchors.filter(
          comment => comment.id !== action.payload.id,
        ),
        activeCommentId:
          state.activeCommentId === action.payload.id
            ? null
            : state.activeCommentId,
        commentHeights: Object.keys(state.commentHeights).reduce(
          (acc, id) =>
            id !== action.payload.id
              ? { ...acc, [id]: state.commentHeights[id] }
              : acc,
          {} as Record<string, number>,
        ),
      };

    case 'SET_ANCHORS':
      return {
        ...state,
        anchors: action.payload,
      };

    case 'SET_DISABLED':
      return {
        ...state,
        disabled: action.payload,
        // Clear selection and newComment when disabling
        ...(action.payload && {
          selection: null,
          newComment: null,
        }),
      };

    default:
      return state;
  }
};
