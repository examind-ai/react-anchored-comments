import { debounce } from 'lodash';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useSelectionContext } from '../contexts/SelectionContext';
import { CommentPositions } from '../types';
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
    commentableContainers,
    comments,
    setCommentableSectionOffsetY,
    setCommentPositionState,
    setActiveCommentId,
    setPositionedSelection,
    showNewCommentBox,
  } = useSelectionContext();

  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    const offset =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    setCommentableSectionOffsetY(offset);
  }, [setCommentableSectionOffsetY]);

  const reposition = useCallback(() => {
    setOffset();

    if (!commentableContainers.current) return;

    setCommentPositionState(prev => ({
      ...prev,
      positions: comments.reduce((acc, comment) => {
        const containerRef =
          commentableContainers.current[
            comment.selectionRange.containerId
          ];

        if (!containerRef?.current) return { ...acc };

        const startPosition = findNodeAndOffsetFromTotalOffset(
          containerRef.current,
          comment.selectionRange.startOffset,
        );
        const endPosition = findNodeAndOffsetFromTotalOffset(
          containerRef.current,
          comment.selectionRange.endOffset,
        );

        if (!startPosition || !endPosition) return { ...acc };

        const range = document.createRange();
        range.setStart(startPosition.node, startPosition.offset);
        range.setEnd(endPosition.node, endPosition.offset);

        // Calculate the updated position
        const rect = range.getBoundingClientRect();
        const scrollTop = document.documentElement.scrollTop;
        const positionTop = rect.top + scrollTop;

        return {
          ...acc,
          [comment.id]: {
            top: positionTop,
          },
        };
      }, {} as CommentPositions),
    }));
  }, [comments, setCommentPositionState, setOffset]);

  useEffect(() => {
    // Initial call to set correct positions.
    // Hack: markdown gets render asynchronously, so we need to wait 1 second.
    timerRef.current = window.setTimeout(() => {
      reposition();
    }, 100);

    const debouncedReposition = debounce(reposition, 250);
    window.addEventListener('resize', debouncedReposition);
    return () => {
      window.clearTimeout(timerRef.current);
      window.removeEventListener('resize', debouncedReposition);
      debouncedReposition.cancel(); // Cancel any pending debounced calls
    };
  }, [reposition]);

  const handleInteraction = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!(e.target instanceof HTMLElement)) return;

    // If new comment box is showing, don't mess with anything:
    if (showNewCommentBox) return;

    // Check for text selection first
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // If there's an actual selection (not just a click)
      if (!range.collapsed) {
        const container =
          range.commonAncestorContainer.parentElement?.closest(
            '[data-container-id]',
          );
        const containerId = container?.getAttribute(
          'data-container-id',
        );
        const isWithinCommentable =
          container && sectionRef.current?.contains(container);

        if (!containerId || !isWithinCommentable) {
          setPositionedSelection(undefined);
          setActiveCommentId(null);
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

        setPositionedSelection({
          startOffset,
          endOffset,
          containerId,
          positionTop,
        });
        setActiveCommentId(null);
        return;
      }
    }

    // If we get here, it means either:
    // 1. There was no selection at all
    // 2. The selection was collapsed (just a click)

    // Now check if clicking on a comment
    const commentId = e.target.getAttribute('data-comment-id');
    if (commentId) {
      e.stopPropagation();
      setActiveCommentId(commentId);
      setPositionedSelection(undefined);
      return;
    }

    // If we get here, it was a click on a non-comment area
    setPositionedSelection(undefined);
    setActiveCommentId(null);
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
