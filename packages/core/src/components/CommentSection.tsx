import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { useAnchoredCommentsContext } from '../contexts/AnchoredCommentsContext';

type RenderPropFn = ({
  activeCommentId,
}: {
  activeCommentId: string | null;
}) => ReactNode;

const CommentSection = ({
  children,
}: {
  children: ReactNode | RenderPropFn;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { state, dispatch } = useAnchoredCommentsContext();

  const { activeCommentId } = state;

  const setOffset = useCallback(() => {
    if (!sectionRef.current) return;

    const offset =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    dispatch({
      type: 'UPDATE_COMMENT_SECTION_OFFSETY',
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
      {typeof children === 'function'
        ? (children as RenderPropFn)({
            activeCommentId,
          })
        : children}
    </div>
  );
};

export default CommentSection;
