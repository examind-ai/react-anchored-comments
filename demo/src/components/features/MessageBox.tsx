import { ReactNode } from 'react';
import type { Message } from '../../types';

const MessageBox = ({
  message,
  children,
}: {
  message: Message;
  children: ReactNode;
}) => {
  return (
    <div
      className={`mb-4 rounded-lg p-4 shadow ${
        message.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-200'
      }`}
    >
      {children}
    </div>
  );
};

export default MessageBox;
