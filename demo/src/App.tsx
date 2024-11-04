import {
  AnchoredCommentsProvider,
  CommentSection,
  CommentView,
  ContentSection,
  ContentView,
  Highlight,
  NewComment,
} from '@examind/react-anchored-comments';
import AddIcon from './components/features/AddIcon';
import CommentBox from './components/features/CommentBox';
import { NewCommentForm } from './components/features/CommentForm';
import MessageBox from './components/features/MessageBox';
import {
  CommentsProvider,
  useCommentsContext,
} from './contexts/CommentsContext';
import { messages } from './data';
import { commentsToAnchors } from './lib/commentToAnchor';

const AppLayout = () => {
  const {
    comments,
    anchors,
    addComment,
    deleteComment,
    editComment,
  } = useCommentsContext();

  return (
    <AnchoredCommentsProvider anchors={anchors}>
      <div className="flex min-h-screen items-start justify-center bg-gray-100 p-4">
        <div className="flex w-full max-w-6xl">
          <div className="relative mr-4 w-2/3 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">AI Chat</h2>
            <ContentSection addIcon={<AddIcon />} iconRight="-3.5rem">
              {messages.map(message => (
                <ContentView key={message.id} contentId={message.id}>
                  <MessageBox message={message}>
                    <Highlight
                      contentId={message.id}
                      markdown={message.content}
                      anchors={commentsToAnchors(
                        comments.filter(
                          c => c.messageId === message.id,
                        ),
                      )}
                      color="#fef2cd"
                      activeColor="#fcbc03"
                    />
                  </MessageBox>
                </ContentView>
              ))}
            </ContentSection>
          </div>
          <div className="w-1/3 rounded-lg bg-white p-6 shadow-md">
            <CommentSection>
              <NewComment>
                {({ selectionRange, onAddSuccess, onCancel }) => (
                  <NewCommentForm
                    handleAddComment={content => {
                      const id = Math.random()
                        .toString(36)
                        .substring(2, 12);

                      addComment({
                        id,
                        messageId: selectionRange.contentId,
                        content,
                        selectionRange,
                      });
                      onAddSuccess(id);
                    }}
                    handleCancel={onCancel}
                  />
                )}
              </NewComment>
              {comments.map(comment => (
                <CommentView key={comment.id} commentId={comment.id}>
                  {({ isActive, onDeleteSuccess }) => (
                    <CommentBox
                      comment={comment}
                      isActive={isActive}
                      editComment={editComment}
                      deleteComment={(commentId: string) => {
                        deleteComment(commentId);
                        onDeleteSuccess();
                      }}
                    />
                  )}
                </CommentView>
              ))}
            </CommentSection>
          </div>
        </div>
      </div>
    </AnchoredCommentsProvider>
  );
};

const App = () => {
  return (
    <CommentsProvider
      initialComments={[
        {
          id: 'comment-1',
          messageId: '3',
          content: 'First comment',
          selectionRange: {
            contentId: '3',
            startOffset: 108,
            endOffset: 130,
          },
        },
        {
          id: 'comment-2',
          messageId: '3',
          content: 'Another comment',
          selectionRange: {
            contentId: '3',
            startOffset: 325,
            endOffset: 423,
          },
        },
        {
          id: 'comment-3',
          messageId: '3',
          content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eu ligula eget enim mollis tincidunt. Proin facilisis odio lectus, at pellentesque mi egestas quis. In hac habitasse platea dictumst. Maecenas vitae accumsan lectus, at porttitor arcu. Suspendisse ornare orci ut mauris varius, at dictum mi rhoncus. Nulla turpis felis, convallis ac vestibulum vel, dignissim vel lorem. Curabitur molestie et ex in dapibus.

Proin ac elit metus. Sed sodales convallis aliquet. Nulla pulvinar in est vehicula gravida. Suspendisse scelerisque varius neque. Pellentesque sed dictum ante, sed posuere orci.`,
          selectionRange: {
            startOffset: 251,
            endOffset: 292,
            contentId: '3',
          },
        },
      ]}
    >
      <AppLayout />
    </CommentsProvider>
  );
};

export default App;
