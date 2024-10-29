import React from 'react';
import { useCommentStateContext } from '../contexts/CommentStateContext';
import { SelectionRange } from '../types';
import CommentPosition from './CommentPosition';

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
  const { state, dispatch } = useCommentStateContext();

  const { newComment } = state;

  if (!newComment) return null;

  const onAddSuccess = (newCommentId: string) => {
    dispatch({
      type: 'ADD_COMMENT',
      payload: {
        id: newCommentId,
        selectionRange: newComment.selectionRange,
      },
    });
  };

  const onCancel = () => {
    dispatch({ type: 'CANCEL_NEW_COMMENT' });
  };

  return (
    <CommentPosition commentId={newComment.id}>
      {children({
        selectionRange: newComment.selectionRange,
        onAddSuccess,
        onCancel,
      })}
    </CommentPosition>
  );
};

export default NewComment;
