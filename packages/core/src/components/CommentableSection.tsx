import { debounce } from 'lodash';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useCommentStateContext } from '../contexts/CommentStateContext';
import {
  findNodeAndOffsetFromTotalOffset,
  getOffsetInTextContent,
} from '../utils';
import NewCommentTrigger from './NewCommentTrigger';

const CommentableSection = ({
  children,
  addIcon,
  iconRight,
}: {
  children: ReactNode;
  addIcon: ReactNode;
  iconRight: string;
}) => {
  const timerRef = useRef<number>();
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    state,
    dispatch,
    commentableContainers,
    recalculatePositions,
  } = useCommentStateContext();

  const { newComment, comments } = state;

  // Function to set the offset of the commentable section
  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    const offset =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    dispatch({
      type: 'UPDATE_COMMENTABLE_SECTION_OFFSETY',
      payload: offset,
    });
  }, [dispatch]);

  const updateTextPositions = useCallback(() => {
    setOffset();

    if (!commentableContainers.current) return;

    const textPositions = comments.reduce(
      (acc, comment) => {
        const containerRef =
          commentableContainers.current[
            comment.selectionRange.containerId
          ];

        if (!containerRef?.current) return acc;

        const startPosition = findNodeAndOffsetFromTotalOffset(
          containerRef.current,
          comment.selectionRange.startOffset,
        );
        const endPosition = findNodeAndOffsetFromTotalOffset(
          containerRef.current,
          comment.selectionRange.endOffset,
        );

        if (!startPosition || !endPosition) return acc;

        const range = document.createRange();
        range.setStart(startPosition.node, startPosition.offset);
        range.setEnd(endPosition.node, endPosition.offset);

        const rect = range.getBoundingClientRect();
        const scrollTop = document.documentElement.scrollTop;
        const positionTop = rect.top + scrollTop;

        acc[comment.id] = { top: positionTop };
        return acc;
      },
      {} as Record<string, { top: number }>,
    );

    dispatch({
      type: 'UPDATE_TEXT_POSITIONS',
      payload: textPositions,
    });
  }, [comments, commentableContainers, dispatch, setOffset]);

  const debouncedUpdateTextPositions = useCallback(
    debounce(updateTextPositions, 50),
    [updateTextPositions],
  );

  useEffect(() => {
    // Initial call to set correct positions.
    // Hack: markdown gets rendered asynchronously, so we need to wait briefly.
    timerRef.current = window.setTimeout(() => {
      debouncedUpdateTextPositions();
    }, 100);

    window.addEventListener('resize', debouncedUpdateTextPositions);

    return () => {
      window.clearTimeout(timerRef.current);
      window.removeEventListener(
        'resize',
        debouncedUpdateTextPositions,
      );
      debouncedUpdateTextPositions.cancel();
    };
  }, [debouncedUpdateTextPositions]);

  useEffect(() => {
    // Recalculate positions when text positions or activeCommentId change
    recalculatePositions();
  }, [
    state.textPositions,
    state.activeCommentId,
    recalculatePositions,
  ]);

  const handleInteraction = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!(e.target instanceof HTMLElement)) return;

    // If new comment box is showing, don't interfere
    if (newComment) return;

    // Check for text selection first
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // If there's an actual selection (not just a click)
      if (!range.collapsed) {
        const container =
          range.commonAncestorContainer instanceof HTMLElement
            ? range.commonAncestorContainer?.closest(
                '[data-container-id]',
              )
            : // If everything selected is a textnode, then range.commonAncestorContainer won't be HTMLElement
              range.commonAncestorContainer.parentElement?.closest(
                '[data-container-id]',
              );
        const containerId = container?.getAttribute(
          'data-container-id',
        );
        const isWithinCommentable =
          container && sectionRef.current?.contains(container);

        if (!containerId || !isWithinCommentable) {
          dispatch({
            type: 'SET_ACTIVE_COMMENT_AND_SELECTION',
            payload: { activeCommentId: null, selection: null },
          });
          return;
        }

        const startOffset = getOffsetInTextContent(
          container,
          range.startContainer,
          range.startOffset,
        );
        const endOffset = getOffsetInTextContent(
          container,
          range.endContainer,
          range.endOffset,
        );

        const rect = range.getBoundingClientRect();
        const scrollTop = document.documentElement.scrollTop;
        const positionTop = rect.top + scrollTop;

        dispatch({
          type: 'SET_ACTIVE_COMMENT_AND_SELECTION',
          payload: {
            activeCommentId: null,
            selection: {
              startOffset,
              endOffset,
              containerId,
              positionTop,
            },
          },
        });
        return;
      }
    }

    // If we get here, it means either:
    // 1. There was no selection at all
    // 2. The selection was collapsed (just a click)

    // Check if clicking on a comment
    const commentId = e.target.getAttribute('data-comment-id');
    if (commentId) {
      e.stopPropagation();
      dispatch({
        type: 'SET_ACTIVE_COMMENT_AND_SELECTION',
        payload: { activeCommentId: commentId, selection: null },
      });
      return;
    }

    // Clicked on a non-comment area
    dispatch({
      type: 'SET_ACTIVE_COMMENT_AND_SELECTION',
      payload: { activeCommentId: null, selection: null },
    });
  };

  return (
    <div
      ref={sectionRef}
      style={{ position: 'relative', height: 'inherit' }}
      onMouseUp={handleInteraction}
    >
      {children}
      <NewCommentTrigger right={iconRight}>
        {addIcon}
      </NewCommentTrigger>
    </div>
  );
};

export default CommentableSection;
