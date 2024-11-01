import { debounce } from 'lodash';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useAnchoredCommentsContext } from '../contexts/AnchoredCommentsContext';
import {
  findNodeAndOffsetFromTotalOffset,
  getOffsetInTextContent,
} from '../utils';
import NewCommentTrigger from './NewCommentTrigger';

const ContentSection = ({
  children,
  addIcon,
  iconRight,
}: {
  children: ReactNode;
  addIcon: ReactNode;
  iconRight: string;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { state, dispatch, contentViews } =
    useAnchoredCommentsContext();

  const { newComment, comments } = state;

  // Function to set the offset of the commentable section
  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    const offset =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    dispatch({
      type: 'UPDATE_CONTENT_SECTION_OFFSETY',
      payload: offset,
    });
  }, [dispatch]);

  const updateTextPositions = useCallback(() => {
    setOffset();

    if (!contentViews.current) return;

    const textPositions = comments.reduce(
      (acc, comment) => {
        const view =
          contentViews.current[comment.selectionRange.contentId];

        if (!view?.current) return acc;

        const startPosition = findNodeAndOffsetFromTotalOffset(
          view.current,
          comment.selectionRange.startOffset,
        );
        const endPosition = findNodeAndOffsetFromTotalOffset(
          view.current,
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
  }, [comments, contentViews, dispatch, setOffset]);

  const debouncedUpdateTextPositions = useCallback(
    debounce(updateTextPositions, 50),
    [updateTextPositions],
  );

  useEffect(() => {
    // Debounce to delay initial call to set correct positions
    // because markdown gets rendered asynchronously.
    debouncedUpdateTextPositions();

    window.addEventListener('resize', debouncedUpdateTextPositions);

    return () => {
      window.removeEventListener(
        'resize',
        debouncedUpdateTextPositions,
      );
      debouncedUpdateTextPositions.cancel();
    };
  }, [debouncedUpdateTextPositions]);

  const handleInteraction = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!(e.target instanceof HTMLElement)) return;

    // If new comment is showing, don't interfere
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
                '[data-content-id]',
              )
            : // If everything selected is a textnode, then range.commonAncestorContainer won't be HTMLElement
              range.commonAncestorContainer.parentElement?.closest(
                '[data-content-id]',
              );
        const contentId = container?.getAttribute('data-content-id');
        const isWithinCommentable =
          container && sectionRef.current?.contains(container);

        if (!contentId || !isWithinCommentable) {
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
              contentId,
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

export default ContentSection;
