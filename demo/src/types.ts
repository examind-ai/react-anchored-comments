import { Comment } from 'react-mdnotes';

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};

export interface MessageComment extends Comment {
  messageId: string;
  text: string;
}
