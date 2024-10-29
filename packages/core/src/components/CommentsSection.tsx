import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { useCommentStateContext } from '../contexts/CommentStateContext';

const CommentsSection = ({ children }: { children: ReactNode }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { dispatch } = useCommentStateContext();

  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    const offset =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    dispatch({
      type: 'UPDATE_COMMENTS_SECTION_OFFSETY',
      payload: offset,
    });
  }, [dispatch]);

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
    <div ref={sectionRef} style={{ position: 'relative' }}>
      {children}
    </div>
  );
};

export default CommentsSection;
