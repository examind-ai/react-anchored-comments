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
}: {
  children: ReactNode;
  addIcon: ReactNode;
}) => {
  const timerRef = useRef<number>();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);

  const { state, dispatch, contentViews } =
    useAnchoredCommentsContext();

  const { newComment, anchors } = state;

  // Function to set the offset of the content section
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

    const textPositions = anchors.reduce(
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

        // Validate that the offsets are valid before creating a range.
        // This prevents the "Uncaught IndexSizeError: Failed to execute 'setEnd' on 'Range': The offset 4294967295 is larger than the node's length (241)."" error
        // which occurs when an invalid offset is passed to range.setEnd() or range.setStart()
        //
        // The error specifically happens when:
        // 1. A negative offset (like -1) exists in a comment's selectionRange
        //    (This can happen if getOffsetInTextContent() fails to find the target node)
        // 2. An offset exceeds the length of its text node
        //    (This can happen if DOM content has changed since the comment was created)
        //
        // To reproduce this error: Set a comment's selectionRange.endOffset to -1
        // When interpreted as an unsigned integer, -1 becomes 4294967295, which is
        // much larger than any node's length, causing the DOM API to throw an error.
        if (
          startPosition.offset < 0 ||
          endPosition.offset < 0 ||
          startPosition.offset > startPosition.node.length ||
          endPosition.offset > endPosition.node.length
        ) {
          console.warn(
            `Invalid range for comment ${comment.id}: ` +
              `startOffset=${startPosition.offset}, nodeLength=${startPosition.node.length}, ` +
              `endOffset=${endPosition.offset}, nodeLength=${endPosition.node.length}`,
          );
          return acc;
        }

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
  }, [anchors, contentViews, dispatch, setOffset]);

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

  const handleInteraction = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!sectionRef.current) return;

      if (!(e.target instanceof HTMLElement)) return;

      // If new comment is showing, don't interfere
      if (newComment) return;

      // Ignore clicks or selections inside CommentView, otherwise we'll deactivate the comment right after CommentView activates it
      if (e.target.closest('[data-comment-view]')) return;

      // Check for text selection first
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // If there's an actual selection (not just a click)
        if (!range.collapsed) {
          if (state.disabled) return;

          // Check if selection spans multiple content sections
          const startContainer =
            range.startContainer instanceof HTMLElement
              ? range.startContainer?.closest('[data-content-id]')
              : range.startContainer.parentElement?.closest(
                  '[data-content-id]',
                );

          const endContainer =
            range.endContainer instanceof HTMLElement
              ? range.endContainer?.closest('[data-content-id]')
              : range.endContainer.parentElement?.closest(
                  '[data-content-id]',
                );

          const startContentId =
            startContainer?.getAttribute('data-content-id');
          const endContentId =
            endContainer?.getAttribute('data-content-id');

          const spansMultiple =
            !!startContentId &&
            !!endContentId &&
            startContentId !== endContentId;

          if (!startContentId || !endContentId || spansMultiple) {
            dispatch({
              type: 'SET_ACTIVE_COMMENT_AND_SELECTION',
              payload: {
                activeCommentId: null,
                selection: null,
                selectionSpansMultipleContents: spansMultiple,
              },
            });
            return;
          }

          const container = startContainer;
          const contentId = startContentId;
          const isWithinContentSection =
            container && sectionRef.current?.contains(container);

          if (!contentId || !isWithinContentSection) {
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
              selectionSpansMultipleContents: false,
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
        payload: {
          activeCommentId: null,
          selection: null,
          selectionSpansMultipleContents: false,
        },
      });
    },
    [newComment, dispatch, state.disabled],
  );

  useEffect(() => {
    const handleDocumentMouseUp = (e: MouseEvent) => {
      handleInteraction(
        e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>,
      );
    };

    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [handleInteraction]);

  return (
    <div
      ref={sectionRef}
      style={{ position: 'relative', height: 'inherit' }}
    >
      {children}
      <NewCommentTrigger contentSectionRef={sectionRef}>
        {addIcon}
      </NewCommentTrigger>
    </div>
  );
};

export default ContentSection;
