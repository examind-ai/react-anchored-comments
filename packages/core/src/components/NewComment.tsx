import React from 'react';
import { useAnchoredCommentsContext } from '../contexts/AnchoredCommentsContext';
import { SelectionRange } from '../types';
import CommentView from './CommentView';

const NewComment = ({
  children,
}: {
  children: ({
    selectionRange,
    onAddSuccess,
    onCancel,
  }: {
    selectionRange: SelectionRange;
    onAddSuccess: (newCommentId: string) => void;
    onCancel: () => void;
  }) => React.ReactNode;
}) => {
  const { state, dispatch } = useAnchoredCommentsContext();

  const { newComment } = state;

  if (!newComment) return null;

  const onAddSuccess = (newCommentId: string) => {
    dispatch({
      type: 'ADD_ANCHOR',
      payload: {
        id: newCommentId,
        selectionRange: {
          contentId: newComment.selectionRange.contentId,
          startOffset: newComment.selectionRange.startOffset,
          endOffset: newComment.selectionRange.endOffset,
        },
      },
    });
  };

  const onCancel = () => {
    dispatch({ type: 'CANCEL_NEW_COMMENT' });
  };

  return (
    <CommentView commentId={newComment.id}>
      {children({
        selectionRange: newComment.selectionRange,
        onAddSuccess,
        onCancel,
      })}
    </CommentView>
  );
};

export default NewComment;
