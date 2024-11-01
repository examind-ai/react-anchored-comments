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
import {
  getAbsoluteTop,
  getTotalScrollOffset,
} from '../utils/elementPosition';
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
  const timerRef = useRef<number>();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);

  const { state, dispatch, contentViews } =
    useAnchoredCommentsContext();

  const { newComment, comments } = state;

  // Function to set the offset of the commentable section
  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    dispatch({
      type: 'UPDATE_CONTENT_SECTION_OFFSETY',
      payload: getAbsoluteTop(
        sectionRef.current,
        getTotalScrollOffset(sectionRef.current),
      ),
    });
  }, [dispatch]);

  const updateTextPositions = useCallback(() => {
    setOffset();

    if (!sectionRef.current) return;
    if (!contentViews.current) return;

    // We can use the sectionRef to get the total scroll offset, as each text position will be scrolling together with the section
    const scrollOffset = getTotalScrollOffset(sectionRef.current);

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

        acc[comment.id] = {
          top: getAbsoluteTop(range, scrollOffset),
        };
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
    // Initial call to set correct positions.
    // Markdown gets rendered asynchronously and the content views
    // and there may be a delay for contentViews to register into contentViews ref,
    // so delay before updating text positions on first run.
    if (isFirstRun.current) {
      timerRef.current = window.setTimeout(() => {
        isFirstRun.current = false;
        updateTextPositions();
      }, 1000);
    } else {
      updateTextPositions();
    }

    return () => {
      window.clearTimeout(timerRef.current);
      // debouncedUpdateTextPositions.cancel();
    };
  }, [updateTextPositions]);

  useEffect(() => {
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

  const handleInteraction = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!sectionRef.current) return;

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

        const positionTop = getAbsoluteTop(
          range,
          getTotalScrollOffset(sectionRef.current),
        );

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
      <NewCommentTrigger
        contentSectionRef={sectionRef}
        right={iconRight}
      >
        {addIcon}
      </NewCommentTrigger>
    </div>
  );
};

export default ContentSection;
