import { ReactNode } from 'react';
import { useCommentStateContext } from '../contexts/CommentStateContext';
import { PositionedSelectionRange } from '../types';

const NewCommentTriggerMount = ({
  selection,
  right,
  children,
}: {
  selection: PositionedSelectionRange;
  right: string;
  children: ReactNode;
}) => {
  const { state, dispatch } = useCommentStateContext();

  const { commentableSectionOffsetY } = state;

  const handleClick = () => {
    dispatch({ type: 'SHOW_NEW_COMMENT_BOX' });
  };

  return (
    <button
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        position: 'absolute',
        top: `${
          (selection.positionTop ?? 0) - commentableSectionOffsetY
        }px`,
        right,
      }}
    >
      {children}
    </button>
  );
};

const NewCommentTrigger = ({
  children,
  right,
}: {
  children: ReactNode;
  right: string;
}) => {
  const { state } = useCommentStateContext();
  const { selection } = state;

  if (!selection) return null;

  return (
    <NewCommentTriggerMount selection={selection} right={right}>
      {children}
    </NewCommentTriggerMount>
  );
};

export default NewCommentTrigger;
