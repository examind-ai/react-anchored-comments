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
  children: React.ReactNode | RenderPropFn;
};

const CommentPosition = ({
  commentId,
  children,
}: CommentPositionProps) => {
  const { state, dispatch, recalculatePositions, commentPositions } =
    useCommentStateContext();

  const { commentsSectionOffsetY, activeCommentId } = state;

  const commentRef = useRef<HTMLDivElement>(null);

  // State to track whether the initial positioning has occurred
  const hasPositionedRef = useRef(false);

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

  // Position off-screen when position is unknown
  const adjustedTop = commentPositions[commentId]?.top ?? -9999;

  useEffect(() => {
    if (adjustedTop !== -9999 && !hasPositionedRef.current)
      hasPositionedRef.current = true;
  }, [adjustedTop]);

  const shouldTransition = hasPositionedRef.current;
  const isOffScreen = adjustedTop === -9999;

  return (
    <div
      ref={commentRef}
      tabIndex={isOffScreen ? -1 : 0} // 0 to make div focusable when not off screen
      style={{
        position: 'absolute',
        top: `${adjustedTop - commentsSectionOffsetY}px`,
        transition: shouldTransition ? 'top 0.3s ease-out' : 'none',
        left: 0,
        width: '100%',
        pointerEvents: isOffScreen ? 'none' : 'auto',
      }}
      onFocus={onFocus}
      aria-hidden={isOffScreen}
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
