import { CommentAnchor } from '@examind/react-anchored-comments';
import { MessageComment } from '../types';

export const commentToAnchor = (comment: MessageComment) =>
  ({
    id: comment.id,
    selectionRange: comment.selectionRange,
  }) satisfies CommentAnchor;

export const commentsToAnchors = (comments: MessageComment[]) =>
  comments.map(commentToAnchor);
