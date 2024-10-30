export interface SelectionRange {
  contentId: string;
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

export type Positions = Record<string, { top: number }>;

export type CommentSize = {
  height: number;
};
