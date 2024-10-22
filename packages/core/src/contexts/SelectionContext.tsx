import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  Comment,
  CommentPositionState,
  PositionedSelectionRange,
} from '../types';

const SelectionContext = createContext<
  | {
      commentableContainers: React.MutableRefObject<
        Partial<Record<string, React.RefObject<HTMLDivElement>>>
      >;
      positionedSelection: PositionedSelectionRange | undefined;
      setPositionedSelection: (
        positionedSelection: PositionedSelectionRange | undefined,
      ) => void;
      commentableSectionOffsetY: number;
      setCommentableSectionOffsetY: (offsetY: number) => void;
      commentsSectionOffsetY: number;
      setCommentsSectionOffsetY: (offsetY: number) => void;
      showNewCommentBox: boolean;
      setShowNewCommentBox: (show: boolean) => void;
      commentPositionState: CommentPositionState;
      setCommentPositionState: React.Dispatch<
        React.SetStateAction<CommentPositionState>
      >;
      activeCommentId: string | null;
      setActiveCommentId: (commentId: string | null) => void;
      newCommentSelection: PositionedSelectionRange | undefined;
      setNewCommentSelection: (
        selection: PositionedSelectionRange | undefined,
      ) => void;
      comments: Comment[];
    }
  | undefined
>(undefined);

export const SelectionProvider = ({
  children,
  comments,
}: {
  children: ReactNode;
  comments: Comment[];
}) => {
  const [commentableSectionOffsetY, setCommentableSectionOffsetY] =
    useState(0);
  const [commentsSectionOffsetY, setCommentsSectionOffsetY] =
    useState(0);
  const [showNewCommentBox, setShowNewCommentBox] = useState(false);
  const [positionedSelection, setPositionedSelection] = useState<
    PositionedSelectionRange | undefined
  >();
  const [commentPositionState, setCommentPositionState] =
    useState<CommentPositionState>({
      positions: {},
      activeCommentId: null,
    });
  const [newCommentSelection, setNewCommentSelection] = useState<
    PositionedSelectionRange | undefined
  >();

  const commentableContainers = useRef<
    Record<string, React.RefObject<HTMLDivElement>>
  >({});

  const setActiveCommentId = useCallback(
    (commentId: string | null) => {
      setCommentPositionState(prev => ({
        ...prev,
        activeCommentId: commentId,
      }));
    },
    [setCommentPositionState],
  );

  const value = useMemo(
    () => ({
      commentableContainers,
      positionedSelection,
      setPositionedSelection,
      commentableSectionOffsetY,
      setCommentableSectionOffsetY,
      commentsSectionOffsetY,
      setCommentsSectionOffsetY,
      showNewCommentBox,
      setShowNewCommentBox,
      commentPositionState,
      setCommentPositionState,
      setActiveCommentId,
      activeCommentId: commentPositionState.activeCommentId,
      newCommentSelection,
      setNewCommentSelection,
      comments,
    }),
    [
      commentableContainers,
      positionedSelection,
      setPositionedSelection,
      commentableSectionOffsetY,
      setCommentableSectionOffsetY,
      commentsSectionOffsetY,
      setCommentsSectionOffsetY,
      showNewCommentBox,
      setShowNewCommentBox,
      commentPositionState,
      setCommentPositionState,
      setActiveCommentId,
      newCommentSelection,
      setNewCommentSelection,
      comments,
    ],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelectionContext = () => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error(
      'useSelectionContext must be used within a SelectionProvider',
    );
  }
  return context;
};
