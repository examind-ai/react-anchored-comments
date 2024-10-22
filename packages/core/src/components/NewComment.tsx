import { ReactNode, useEffect } from 'react';
import CommentPosition from './CommentPosition';
import { NEW_COMMENT_ID } from '../constants';
import { useSelectionContext } from '../contexts/SelectionContext';
import { PositionedSelectionRange, SelectionRange } from '../types';

const NewCommentPosition = ({
  newCommentSelection,
  children,
}: {
  newCommentSelection: PositionedSelectionRange;
  children: ({
    selectionRange,
    setShowNewCommentBox,
    setActiveCommentId,
  }: {
    selectionRange: SelectionRange;
    setShowNewCommentBox: (show: boolean) => void;
    setActiveCommentId: (commentId: string | null) => void;
  }) => ReactNode;
}) => {
  const {
    setShowNewCommentBox,
    setCommentPositionState,
    setActiveCommentId,
  } = useSelectionContext();

  useEffect(() => {
    setCommentPositionState(prev => {
      const positions = { ...prev.positions };
      positions[NEW_COMMENT_ID] = {
        top: newCommentSelection.positionTop,
      };
      return {
        positions,
        activeCommentId: NEW_COMMENT_ID,
      };
    });

    return () => {
      setCommentPositionState(prev => {
        const positions = { ...prev.positions };
        delete positions[NEW_COMMENT_ID];
        return {
          positions,
          activeCommentId:
            prev.activeCommentId === NEW_COMMENT_ID
              ? null
              : prev.activeCommentId,
        };
      });
    };
  }, []);

  // Even though we have PositionedSelectionRange here, we don't want to leak positionTop outside of this plugin
  const selectionRange = {
    containerId: newCommentSelection.containerId,
    startOffset: newCommentSelection.startOffset,
    endOffset: newCommentSelection.endOffset,
  };

  return (
    <CommentPosition
      comment={{
        id: NEW_COMMENT_ID,
        selectionRange,
      }}
      transition={false}
    >
      {children({
        selectionRange,
        setShowNewCommentBox,
        setActiveCommentId,
      })}
    </CommentPosition>
  );
};

const NewComment = ({
  children,
}: {
  children: ({
    selectionRange,
    setShowNewCommentBox,
    setActiveCommentId,
  }: {
    selectionRange: SelectionRange;
    setShowNewCommentBox: (show: boolean) => void;
    setActiveCommentId: (commentId: string | null) => void;
  }) => ReactNode;
}) => {
  const { newCommentSelection, showNewCommentBox } =
    useSelectionContext();

  if (!newCommentSelection || !showNewCommentBox) return null;

  return (
    <NewCommentPosition newCommentSelection={newCommentSelection}>
      {children}
    </NewCommentPosition>
  );
};

export default NewComment;
