import { ReactNode } from 'react';
import { useAnchoredCommentsContext } from '../contexts/AnchoredCommentsContext';
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
  const { state, dispatch } = useAnchoredCommentsContext();

  const { contentSectionOffsetY } = state;

  const handleClick = () => {
    dispatch({ type: 'SHOW_NEW_COMMENT' });
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
          (selection.positionTop ?? 0) - contentSectionOffsetY
        }px`,
        right,
        zIndex: 100,
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
  const { state } = useAnchoredCommentsContext();
  const { selection } = state;

  if (!selection) return null;

  return (
    <NewCommentTriggerMount selection={selection} right={right}>
      {children}
    </NewCommentTriggerMount>
  );
};

export default NewCommentTrigger;
