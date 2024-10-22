import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { CommentPositionProvider } from '../contexts/CommentPositionContext';
import { useSelectionContext } from '../contexts/SelectionContext';

const CommentsSection = ({ children }: { children: ReactNode }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { setCommentsSectionOffsetY: setCommentsOffsetY } =
    useSelectionContext();

  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    const offset =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    setCommentsOffsetY(offset);
  }, [setCommentsOffsetY]);

  useEffect(() => {
    // Initial call to set offset
    setOffset();

    const debouncedHandleResize = debounce(setOffset, 250);
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      debouncedHandleResize.cancel(); // Cancel any pending debounced calls
    };
  }, [setOffset]);

  return (
    <CommentPositionProvider>
      <div ref={sectionRef} style={{ position: 'relative' }}>
        {children}
      </div>
    </CommentPositionProvider>
  );
};

export default CommentsSection;
