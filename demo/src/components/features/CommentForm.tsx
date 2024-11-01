import { KeyboardEvent, useEffect, useRef } from 'react';
import type { MessageComment } from '../../types';

interface BaseCommentFormProps {
  onSubmit: (content: string) => void;
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!commentFormRef.current) return;

    const textarea = commentFormRef.current.elements.namedItem(
      'comment',
    ) as HTMLTextAreaElement;

    // Focusing immedately is a problem because plugin initially sets top to -9999px while it's measuring
    // height. Focusing during this period will cause the vertical scroll to jump to the top.
    timerRef.current = setTimeout(() => {
      textarea.focus();
    }, 100);

    () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const submitComment = () => {
    if (!commentFormRef.current) return;

    const form = commentFormRef.current;
    const content = (
      form.elements.namedItem('comment') as HTMLTextAreaElement
    ).value;

    if (!content) return;

    onSubmit(content);
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
  handleCancel,
}: {
  handleAddComment: (content: string) => void;
  handleCancel: () => void;
}) => {
  return (
    <div className="mb-2 rounded-lg bg-gray-100 p-3">
      <div className="mb-2 flex items-center">
        <span className="font-bold">Jane Doe</span>
      </div>
      <BaseCommentForm
        onSubmit={(content: string) => {
          handleAddComment(content);
        }}
        onCancel={handleCancel}
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
  onSave: (content: string) => void;
  onCancel: () => void;
}) => {
  return (
    <BaseCommentForm
      onSubmit={onSave}
      onCancel={onCancel}
      initialText={comment.content}
      submitLabel="Save"
    />
  );
};

export { EditCommentForm, NewCommentForm };
