import { ReactNode, useEffect } from 'react';
import { useSelectionContext } from '../contexts/SelectionContext';
import { PositionedSelectionRange } from '../types';

const NewCommentTriggerMount = ({
  positionedSelection,
  right,
  children,
}: {
  positionedSelection: PositionedSelectionRange;
  right: string;
  children: ReactNode;
}) => {
  const {
    commentableSectionOffsetY,
    setShowNewCommentBox,
    setNewCommentSelection,
    setPositionedSelection,
  } = useSelectionContext();

  // Reset showNewCommentBox state so new comment box doesn't show automatically on text select
  useEffect(() => setShowNewCommentBox(false), []);

  const handleClick = () => {
    setNewCommentSelection(positionedSelection);

    setShowNewCommentBox(true);
    setPositionedSelection(undefined);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: `${
          (positionedSelection.positionTop ?? 0) -
          commentableSectionOffsetY
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
  const { positionedSelection } = useSelectionContext();

  if (!positionedSelection) return null;

  return (
    <NewCommentTriggerMount
      positionedSelection={positionedSelection}
      right={right}
    >
      {children}
    </NewCommentTriggerMount>
  );
};

export default NewCommentTrigger;
