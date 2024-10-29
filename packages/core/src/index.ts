// Components
export { default as CommentableContainer } from './components/CommentableContainer';
export { default as CommentableSection } from './components/CommentableSection';
export { default as CommentPosition } from './components/CommentPosition';
export { default as CommentsSection } from './components/CommentsSection';
export { default as Highlight } from './components/Highlight';
export { default as NewComment } from './components/NewComment';
export { default as NewCommentTrigger } from './components/NewCommentTrigger';

// Contexts & their hooks
export { CommentStateProvider } from './contexts/CommentStateContext';
export { createCommentContext } from './contexts/createCommentContext';

// Types
export type { CommentContextReturn } from './contexts/createCommentContext';
export type { Comment, SelectionRange } from './types';
