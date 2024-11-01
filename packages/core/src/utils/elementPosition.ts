const getScrollContainer = (element: HTMLElement): HTMLElement => {
  let parent = element.parentElement;
  while (parent) {
    const { overflow } = window.getComputedStyle(parent);
    if (overflow.includes('auto') || overflow.includes('scroll')) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.documentElement;
};

export const getTotalScrollOffset = (
  element: HTMLElement,
): number => {
  let scrollOffset = window.scrollY;

  const scrollContainer = getScrollContainer(element);

  if (scrollContainer !== document.documentElement) {
    scrollOffset += scrollContainer.scrollTop;
  }

  return scrollOffset;
};

export const getAbsoluteTop = (
  element: HTMLElement | Range,
  totalScrollOffset: number,
): number => element.getBoundingClientRect().top + totalScrollOffset;
