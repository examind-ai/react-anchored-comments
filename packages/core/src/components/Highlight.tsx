import parse from 'html-react-parser';
import { marked } from 'marked';
import React, { useEffect, useState } from 'react';
import { NEW_COMMENT_ID } from '../constants';
import { useAnchoredCommentsContext } from '../contexts/AnchoredCommentsContext';
import { Comment } from '../types';

const Highlight = ({
  contentId,
  markdown,
  comments,
  color,
  activeColor,
}: {
  contentId: string;
  markdown: string;
  comments: Comment[];
  color: string;
  activeColor: string;
}) => {
  const [result, setResult] = useState<{ node: React.ReactNode }>({
    node: null,
  });

  const { state } = useAnchoredCommentsContext();

  const { newComment, activeCommentId } = state;

  useEffect(() => {
    // Collect all ranges to be highlighted
    const selectionRanges: Array<Comment> = comments.map(comment => ({
      id: comment.id,
      selectionRange: comment.selectionRange,
    }));

    if (contentId === newComment?.selectionRange.contentId)
      selectionRanges.push({
        id: NEW_COMMENT_ID,
        selectionRange: newComment.selectionRange,
      });

    const processMarkdown = async () => {
      const htmlContent = await marked(markdown);
      const reactElements = parse(htmlContent);
      const result = processChildren(
        reactElements,
        0,
        selectionRanges,
        activeCommentId,
        color,
        activeColor,
      );
      setResult(result);
    };

    processMarkdown();
  }, [setResult, markdown, comments, activeCommentId]);

  return <>{result.node}</>;
};

export default Highlight;

function processNode(
  node: React.ReactNode,
  offset: number,
  comments: Comment[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
): { node: React.ReactNode; offset: number } {
  if (typeof node === 'string') {
    return processTextNode(
      node,
      offset,
      comments,
      activeCommentId,
      color,
      activeColor,
    );
  } else if (React.isValidElement(node)) {
    return processElementNode(
      node,
      offset,
      comments,
      activeCommentId,
      color,
      activeColor,
    );
  } else if (Array.isArray(node)) {
    return processArrayNode(
      node,
      offset,
      comments,
      activeCommentId,
      color,
      activeColor,
    );
  } else {
    return { node, offset };
  }
}

function processChildren(
  children: React.ReactNode,
  offset: number,
  comments: Comment[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
): { node: React.ReactNode; offset: number } {
  if (Array.isArray(children)) {
    return processArrayNode(
      children,
      offset,
      comments,
      activeCommentId,
      color,
      activeColor,
    );
  } else {
    return processNode(
      children,
      offset,
      comments,
      activeCommentId,
      color,
      activeColor,
    );
  }
}

function processTextNode(
  text: string,
  offset: number,
  comments: Comment[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
): { node: React.ReactNode; offset: number } {
  const length = text.length;
  const end = offset + length;

  const ranges = getHighlightRangesForTextNode(offset, end, comments);

  if (ranges.length === 0) {
    return { node: text, offset: end };
  }

  const nodes: React.ReactNode[] = [];

  // Collect all unique positions
  const positions = new Set<number>();
  positions.add(offset);
  positions.add(end);

  ranges.forEach(range => {
    positions.add(range.start);
    positions.add(range.end);
  });

  const sortedPositions = Array.from(positions).sort((a, b) => a - b);

  for (let i = 0; i < sortedPositions.length - 1; i++) {
    const segmentStart = sortedPositions[i];
    const segmentEnd = sortedPositions[i + 1];

    const relativeStart = segmentStart - offset;
    const relativeEnd = segmentEnd - offset;

    const segmentText = text.slice(relativeStart, relativeEnd);

    // Find all comments covering this segment
    const coveringComments = ranges.filter(
      range => range.start <= segmentStart && range.end >= segmentEnd,
    );

    if (coveringComments.length === 0) {
      // No highlights, plain text
      nodes.push(segmentText);
    } else {
      // Determine if any covering comment matches activeCommentId
      const isActive = activeCommentId
        ? coveringComments.some(
            range => range.commentId === activeCommentId,
          )
        : false;

      nodes.push(
        <span
          data-comment-id={coveringComments[0].commentId}
          key={segmentStart}
          style={{
            background: isActive ? activeColor : color,
          }}
        >
          {segmentText}
        </span>,
      );
    }
  }

  return {
    node: nodes.length === 1 ? nodes[0] : nodes,
    offset: end,
  };
}

function processElementNode(
  element: React.ReactElement,
  offset: number,
  comments: Comment[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
): { node: React.ReactNode; offset: number } {
  const { children } = element.props;
  const { node: processedChildren, offset: newOffset } =
    processChildren(
      children,
      offset,
      comments,
      activeCommentId,
      color,
      activeColor,
    );

  return {
    node: React.cloneElement(element, {
      ...element.props,
      children: processedChildren,
    }),
    offset: newOffset,
  };
}

function processArrayNode(
  nodes: React.ReactNode[],
  offset: number,
  comments: Comment[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
): { node: React.ReactNode[]; offset: number } {
  const processedNodes: React.ReactNode[] = [];
  let currentOffset = offset;

  nodes.forEach(child => {
    const { node: processedNode, offset: newOffset } = processNode(
      child,
      currentOffset,
      comments,
      activeCommentId,
      color,
      activeColor,
    );
    processedNodes.push(processedNode);
    currentOffset = newOffset;
  });

  return { node: processedNodes, offset: currentOffset };
}

function getHighlightRangesForTextNode(
  start: number,
  end: number,
  comments: Comment[],
): { start: number; end: number; commentId: string }[] {
  const ranges: { start: number; end: number; commentId: string }[] =
    [];

  comments.forEach(comment => {
    const selStart = comment.selectionRange.startOffset;
    const selEnd = comment.selectionRange.endOffset;

    const overlapStart = Math.max(start, selStart);
    const overlapEnd = Math.min(end, selEnd);

    if (overlapStart < overlapEnd) {
      ranges.push({
        start: overlapStart,
        end: overlapEnd,
        commentId: comment.id,
      });
    }
  });

  return ranges;
}
