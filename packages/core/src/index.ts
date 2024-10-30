// Components
export { default as CommentSection } from './components/CommentSection';
export { default as CommentView } from './components/CommentView';
export { default as ContentSection } from './components/ContentSection';
export { default as ContentView } from './components/ContentView';
export { default as Highlight } from './components/Highlight';
export { default as NewComment } from './components/NewComment';
export { default as NewCommentTrigger } from './components/NewCommentTrigger';

// Contexts & their hooks
export { AnchoredCommentsProvider } from './contexts/AnchoredCommentsContext';
export { createCommentContext } from './contexts/createCommentContext';

// Types
export type { CommentContextReturn } from './contexts/createCommentContext';
export type { Comment, SelectionRange } from './types';
