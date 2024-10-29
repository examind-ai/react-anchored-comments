import { ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { useCommentStateContext } from '../contexts/CommentStateContext';

type RenderPropFn = ({
  isActive,
  onDeleteSuccess,
}: {
  isActive: boolean;
  onDeleteSuccess: () => void;
}) => ReactNode;

type CommentPositionProps = {
  commentId: string;
  transition?: boolean;
  children: React.ReactNode | RenderPropFn;
};

const CommentPosition = ({
  commentId,
  children,
  transition = true,
}: CommentPositionProps) => {
  const { state, dispatch, recalculatePositions, commentPositions } =
    useCommentStateContext();

  const { commentsSectionOffsetY, activeCommentId } = state;

  const commentRef = useRef<HTMLDivElement>(null);

  const updateHeightAndRecalculate = () => {
    if (!commentRef.current) return;

    const height = commentRef.current.getBoundingClientRect().height;
    dispatch({
      type: 'UPDATE_COMMENT_HEIGHT',
      payload: { id: commentId, height },
    });
    recalculatePositions();
  };

  // Measure initial height
  useLayoutEffect(() => {
    updateHeightAndRecalculate();
  }, []);

  // Monitor dynamic height changes
  useLayoutEffect(() => {
    if (!commentRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateHeightAndRecalculate();
    });

    resizeObserver.observe(commentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!commentRef.current) return;

    const element = commentRef.current;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't focus the parent container if user clicked on:
      // - Buttons: Have their own focus and click behavior
      // - Links: Need to handle navigation
      // - Inputs/Textareas: Need to handle text entry
      // - Custom buttons: Elements with role="button" (like div styled as button)
      const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA'];
      if (
        interactiveTags.includes(target.tagName) ||
        // closest() checks if the clicked element or any of its parents have role="button"
        // This catches custom button implementations that don't use <button> tags
        target.closest('[role="button"]')
      )
        return;

      element.focus();
    };

    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, []);

  const onDeleteSuccess = () => {
    dispatch({ type: 'DELETE_COMMENT', payload: { id: commentId } });
  };

  const onFocus = () => {
    dispatch({ type: 'SET_ACTIVE_COMMENT_ID', payload: commentId });
  };

  const adjustedTop = commentPositions[commentId]?.top || 0;

  return (
    <div
      ref={commentRef}
      tabIndex={0} // Make the div focusable
      style={{
        position: 'absolute',
        top: `${adjustedTop - commentsSectionOffsetY}px`,
        transition: transition ? 'top 0.3s ease-out' : 'none',
        left: 0,
        width: '100%',
      }}
      onFocus={onFocus}
    >
      {typeof children === 'function'
        ? (children as RenderPropFn)({
            isActive: activeCommentId === commentId,
            onDeleteSuccess,
          })
        : children}
    </div>
  );
};

export default CommentPosition;
