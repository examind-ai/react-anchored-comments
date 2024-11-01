import { SelectionRange } from '@examind/react-anchored-comments';

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};

export interface MessageComment {
  id: string;
  messageId: string;
  content: string;
  selectionRange: SelectionRange;
}
