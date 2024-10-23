import { KeyboardEvent, useEffect, useRef } from 'react';
import type { MessageComment } from '../../types';

interface BaseCommentFormProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  initialText?: string;
  submitLabel?: string;
}

const BaseCommentForm = ({
  onSubmit,
  onCancel,
  initialText = '',
  submitLabel = 'Comment',
}: BaseCommentFormProps) => {
  const commentFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!commentFormRef.current) return;

    const textarea = commentFormRef.current.elements.namedItem(
      'comment',
    ) as HTMLTextAreaElement;
    textarea.focus();
  }, []);

  const submitComment = () => {
    if (!commentFormRef.current) return;

    const form = commentFormRef.current;
    const commentText = (
      form.elements.namedItem('comment') as HTMLTextAreaElement
    ).value;

    if (!commentText) return;

    onSubmit(commentText);
    form.reset();
  };

  const handleCommentSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    submitComment();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      submitComment();
    }
  };

  return (
    <form ref={commentFormRef} onSubmit={handleCommentSubmit}>
      <textarea
        name="comment"
        placeholder="Add a comment"
        defaultValue={initialText}
        className="w-full resize-none rounded-lg border border-gray-300 bg-white p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        onKeyDown={handleKeyDown}
      ></textarea>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

const NewCommentForm = ({
  handleAddComment,
  setShowNewCommentBox,
}: {
  handleAddComment: (text: string) => void;
  setShowNewCommentBox: (show: boolean) => void;
}) => {
  return (
    <div className="mb-2 rounded-lg bg-gray-100 p-3">
      <div className="mb-2 flex items-center">
        <span className="font-bold">Jane Doe</span>
      </div>
      <BaseCommentForm
        onSubmit={(text: string) => {
          handleAddComment(text);
          setShowNewCommentBox(false);
        }}
        onCancel={() => setShowNewCommentBox(false)}
      />
    </div>
  );
};

const EditCommentForm = ({
  comment,
  onSave,
  onCancel,
}: {
  comment: MessageComment;
  onSave: (text: string) => void;
  onCancel: () => void;
}) => {
  return (
    <BaseCommentForm
      onSubmit={onSave}
      onCancel={onCancel}
      initialText={comment.text}
      submitLabel="Save"
    />
  );
};

export { EditCommentForm, NewCommentForm };
