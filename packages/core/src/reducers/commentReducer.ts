import { NEW_COMMENT_ID } from '../constants';
import {
  CommentAction,
  CommentState,
} from '../contexts/CommentStateContext';

export const commentReducer = (
  state: CommentState,
  action: CommentAction,
): CommentState => {
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
      };

    case 'SHOW_NEW_COMMENT_BOX':
      if (!state.selection) return state; // Cannot show new comment box without a selection
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

    case 'UPDATE_COMMENTABLE_SECTION_OFFSETY':
      return { ...state, commentableSectionOffsetY: action.payload };

    case 'UPDATE_COMMENTS_SECTION_OFFSETY':
      return { ...state, commentsSectionOffsetY: action.payload };

    case 'ADD_COMMENT':
      return {
        ...state,
        comments: [...state.comments, action.payload],
        newComment: null,
        activeCommentId: action.payload.id,
      };

    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(
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

    default:
      return state;
  }
};
