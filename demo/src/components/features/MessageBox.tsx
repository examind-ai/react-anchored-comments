import type { CommentAnchor } from '@examind/react-anchored-comments';
import { Highlight } from '@examind/react-anchored-comments';
import type { Message } from '../../types';

const MessageBox = ({
  message,
  anchors,
}: {
  message: Message;
  anchors: CommentAnchor[];
}) => {
  return (
    <div
      className={`mb-4 rounded-lg p-4 shadow ${
        message.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-200'
      }`}
    >
      <Highlight
        contentId={message.id}
        markdown={message.content}
        anchors={anchors}
        color="#fef2cd"
        activeColor="#fcbc03"
      />
    </div>
  );
};

export default MessageBox;
