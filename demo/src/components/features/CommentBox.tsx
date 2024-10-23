import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { MoreVertical } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { MessageComment } from '../../types';
import { EditCommentForm } from './CommentForm';

const MAX_HEIGHT = 100;
const EXPANDED_MAX_HEIGHT = 1000; // This should be larger than any expected comment height

const renderComment = (text: string) => {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const CommentContent: React.FC<{
  comment: MessageComment;
  isActive: boolean;
}> = ({ comment, isActive }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShowMore, setShowShowMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setShowShowMore(contentRef.current.scrollHeight > MAX_HEIGHT);
    }
  }, [comment.text]);

  useEffect(() => {
    if (!isActive) setIsExpanded(false);
  }, [isActive, setIsExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          maxHeight: isExpanded
            ? `${EXPANDED_MAX_HEIGHT}px` // We use EXPANDED_MAX_HEIGHT instead of none so that transition works
            : `${MAX_HEIGHT}px`,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-out',
        }}
      >
        {renderComment(comment.text)}
      </div>
      {showShowMore && (
        <button
          onClick={toggleExpand}
          className="mt-2 cursor-pointer border-none bg-transparent text-blue-600"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

const CommentBox: React.FC<{
  comment: MessageComment;
  isActive: boolean;
  editComment: (commentId: string, text: string) => void;
  deleteComment: (commentId: string) => void;
}> = ({ comment, isActive, editComment, deleteComment }) => {
  const [editing, setEditing] = useState(false);

  const onEditClick = () => {
    setEditing(true);
  };

  return (
    <div
      className={`mb-2 rounded-lg p-3 transition-colors duration-200 ${
        isActive ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-100'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-bold">Jane Doe</span>
          <span className="ml-2 text-gray-600">12:32PM Oct 10</span>
        </div>
        {isActive && !editing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-1 transition-colors hover:bg-gray-200">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-50 w-24 rounded-md border bg-white shadow-md"
            >
              <DropdownMenuItem
                onClick={onEditClick}
                className="cursor-pointer px-2 py-2 hover:bg-slate-50"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteComment(comment.id)}
                className="cursor-pointer px-2 py-2 text-red-600 hover:bg-slate-50 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {editing ? (
        <EditCommentForm
          comment={comment}
          onSave={text => {
            editComment(comment.id, text);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <CommentContent comment={comment} isActive={isActive} />
      )}
    </div>
  );
};

export default CommentBox;
