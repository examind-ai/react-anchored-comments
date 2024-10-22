import { ReactNode, useEffect, useRef } from 'react';
import { useSelectionContext } from '../contexts/SelectionContext';

const CommentableContainer = ({
  containerId,
  children,
}: {
  containerId: string;
  children: ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { commentableContainers } = useSelectionContext();

  useEffect(() => {
    commentableContainers.current[containerId] = containerRef;
    return () => {
      delete commentableContainers.current[containerId];
    };
  }, []);

  return (
    <div data-container-id={containerId} ref={containerRef}>
      {children}
    </div>
  );
};

export default CommentableContainer;
