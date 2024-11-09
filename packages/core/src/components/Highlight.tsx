import parse from 'html-react-parser';
import { marked } from 'marked';
import React, { useEffect, useState } from 'react';
import { NEW_COMMENT_ID } from '../constants';
import { useAnchoredCommentsContext } from '../contexts/AnchoredCommentsContext';
import { CommentAnchor } from '../types';

const Highlight = ({
  contentId,
  markdown,
  anchors,
}: {
  contentId: string;
  markdown: string;
  anchors: CommentAnchor[];
}) => {
  const [result, setResult] = useState<{ node: React.ReactNode }>({
    node: null,
  });

  const { state, settings } = useAnchoredCommentsContext();

  const { newComment, activeCommentId } = state;

  useEffect(() => {
    // Collect all anchors to be highlighted
    const allAnchors: Array<CommentAnchor> = [...anchors];

    if (contentId === newComment?.selectionRange.contentId)
      allAnchors.push({
        id: NEW_COMMENT_ID,
        selectionRange: newComment.selectionRange,
      });

    const processMarkdown = async () => {
      const htmlContent = await marked(markdown);
      const reactElements = parse(htmlContent);
      const result = processChildren(
        reactElements,
        0,
        allAnchors,
        activeCommentId,
        settings.highlight.color,
        settings.highlight.activeColor,
        settings.highlight.paddingY,
      );
      setResult(result);
    };

    processMarkdown();
  }, [setResult, markdown, anchors, activeCommentId]);

  return <>{result.node}</>;
};

export default Highlight;

function processNode(
  node: React.ReactNode,
  offset: number,
  anchors: CommentAnchor[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
  paddingY: string,
): { node: React.ReactNode; offset: number } {
  if (typeof node === 'string') {
    return processTextNode(
      node,
      offset,
      anchors,
      activeCommentId,
      color,
      activeColor,
      paddingY,
    );
  } else if (React.isValidElement(node)) {
    return processElementNode(
      node,
      offset,
      anchors,
      activeCommentId,
      color,
      activeColor,
      paddingY,
    );
  } else if (Array.isArray(node)) {
    return processArrayNode(
      node,
      offset,
      anchors,
      activeCommentId,
      color,
      activeColor,
      paddingY,
    );
  } else {
    return { node, offset };
  }
}

function processChildren(
  children: React.ReactNode,
  offset: number,
  anchors: CommentAnchor[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
  paddingY: string,
): { node: React.ReactNode; offset: number } {
  if (Array.isArray(children)) {
    return processArrayNode(
      children,
      offset,
      anchors,
      activeCommentId,
      color,
      activeColor,
      paddingY,
    );
  } else {
    return processNode(
      children,
      offset,
      anchors,
      activeCommentId,
      color,
      activeColor,
      paddingY,
    );
  }
}

function processTextNode(
  content: string,
  offset: number,
  anchors: CommentAnchor[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
  paddingY: string,
): { node: React.ReactNode; offset: number } {
  const length = content.length;
  const end = offset + length;

  const ranges = getHighlightRangesForTextNode(offset, end, anchors);

  if (ranges.length === 0) {
    return { node: content, offset: end };
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

    const segmentText = content.slice(relativeStart, relativeEnd);

    // Find all anchors covering this segment
    const coveringAnchors = ranges.filter(
      range => range.start <= segmentStart && range.end >= segmentEnd,
    );

    if (coveringAnchors.length === 0) {
      // No highlights, plain text
      nodes.push(segmentText);
    } else {
      // Determine if any covering comment matches activeCommentId
      const isActive = activeCommentId
        ? coveringAnchors.some(
            range => range.commentId === activeCommentId,
          )
        : false;

      nodes.push(
        <span
          data-comment-id={coveringAnchors[0].commentId}
          key={segmentStart}
          style={{
            background: isActive ? activeColor : color,
            padding: `${paddingY} 0`, // Increase paddingY to prevent vertical color gap between multiple lines that are highlighted
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
  anchors: CommentAnchor[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
  paddingY: string,
): { node: React.ReactNode; offset: number } {
  const { children } = element.props;
  const { node: processedChildren, offset: newOffset } =
    processChildren(
      children,
      offset,
      anchors,
      activeCommentId,
      color,
      activeColor,
      paddingY,
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
  anchors: CommentAnchor[],
  activeCommentId: string | null,
  color: string,
  activeColor: string,
  paddingY: string,
): { node: React.ReactNode[]; offset: number } {
  const processedNodes: React.ReactNode[] = [];
  let currentOffset = offset;

  nodes.forEach(child => {
    const { node: processedNode, offset: newOffset } = processNode(
      child,
      currentOffset,
      anchors,
      activeCommentId,
      color,
      activeColor,
      paddingY,
    );
    processedNodes.push(processedNode);
    currentOffset = newOffset;
  });

  return { node: processedNodes, offset: currentOffset };
}

function getHighlightRangesForTextNode(
  start: number,
  end: number,
  anchors: CommentAnchor[],
): { start: number; end: number; commentId: string }[] {
  const ranges: { start: number; end: number; commentId: string }[] =
    [];

  anchors.forEach(anchor => {
    const selStart = anchor.selectionRange.startOffset;
    const selEnd = anchor.selectionRange.endOffset;

    const overlapStart = Math.max(start, selStart);
    const overlapEnd = Math.min(end, selEnd);

    if (overlapStart < overlapEnd) {
      ranges.push({
        start: overlapStart,
        end: overlapEnd,
        commentId: anchor.id,
      });
    }
  });

  return ranges;
}
