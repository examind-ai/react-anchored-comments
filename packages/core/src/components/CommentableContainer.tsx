import { ReactNode, useEffect, useRef } from 'react';
import { useCommentStateContext } from '../contexts/CommentStateContext';

const CommentableContainer = ({
  containerId,
  children,
}: {
  containerId: string;
  children: ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { commentableContainers } = useCommentStateContext();

  useEffect(() => {
    commentableContainers.current[containerId] = containerRef;
    return () => {
      delete commentableContainers.current[containerId];
    };
  }, [containerId]);

  return (
    <div data-container-id={containerId} ref={containerRef}>
      {children}
    </div>
  );
};

export default CommentableContainer;
