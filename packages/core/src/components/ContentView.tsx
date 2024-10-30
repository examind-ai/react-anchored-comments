import { ReactNode, useEffect, useRef } from 'react';
import { useAnchoredCommentsContext } from '../contexts/AnchoredCommentsContext';

const ContentView = ({
  contentId,
  children,
}: {
  contentId: string;
  children: ReactNode;
}) => {
  const viewRef = useRef<HTMLDivElement>(null);

  const { contentViews } = useAnchoredCommentsContext();

  useEffect(() => {
    contentViews.current[contentId] = viewRef;
    return () => {
      delete contentViews.current[contentId];
    };
  }, [contentId]);

  return (
    <div data-content-id={contentId} ref={viewRef}>
      {children}
    </div>
  );
};

export default ContentView;
