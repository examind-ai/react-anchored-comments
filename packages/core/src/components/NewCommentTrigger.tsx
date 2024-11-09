import { ReactNode } from 'react';
import { useAnchoredCommentsContext } from '../contexts/AnchoredCommentsContext';
import {
  getAbsoluteTop,
  getTotalScrollOffset,
} from '../utils/elementPosition';

const NewCommentTrigger = ({
  contentSectionRef,
  children,
}: {
  contentSectionRef: React.RefObject<HTMLDivElement>;
  children: ReactNode;
}) => {
  const { state, dispatch, settings } = useAnchoredCommentsContext();
  const { selection } = state;

  if (!selection) return null;

  const handleClick = () => {
    dispatch({ type: 'SHOW_NEW_COMMENT' });
  };

  const contentSectionAbsoluteTop = contentSectionRef.current
    ? getAbsoluteTop(
        contentSectionRef.current,
        getTotalScrollOffset(contentSectionRef.current),
      )
    : 0;

  return (
    <button
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        position: 'absolute',
        top: `${
          (selection.positionTop ?? 0) - contentSectionAbsoluteTop
        }px`,
        right: settings.addCommentIconPositionRight,
        zIndex: 100,
      }}
    >
      {children}
    </button>
  );
};

export default NewCommentTrigger;
