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
      type: 'ON_ADD_COMMENT',
      payload: {
        id: newCommentId,
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
