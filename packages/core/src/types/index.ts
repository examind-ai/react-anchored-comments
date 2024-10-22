export interface SelectionRange {
  containerId: string;
  startOffset: number;
  endOffset: number;
}

export interface PositionedSelectionRange extends SelectionRange {
  positionTop: number;
}

export interface Comment {
  id: string;
  selectionRange: SelectionRange;
}

export type CommentPositions = Record<string, { top: number }>;

export interface CommentPositionState {
  positions: CommentPositions;
  activeCommentId: string | null;
}

export type CommentSize = {
  height: number;
};
