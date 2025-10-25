/**
 * Retrieves all text nodes within a given element.
 * @param element - The root element to search for text nodes.
 * @returns An array of Text nodes found within the element.
 */
const getTextNodesInElement = (element: Node): Text[] => {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
  );

  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  return textNodes;
};

/**
 * Calculates the total offset for a text node within an element's text content.
 * @param element - The container element.
 * @param targetNode - The text node to find the offset for.
 * @param offsetInNode - The offset within the text node.
 * @returns The total offset in the element's text content, or -1 if not found.
 */
const getOffsetForTextNode = (
  element: Element,
  targetNode: Node,
  offsetInNode: number,
): number => {
  const textNodes = getTextNodesInElement(element);
  let totalOffset = 0;

  for (const textNode of textNodes) {
    if (textNode === targetNode) {
      return totalOffset + offsetInNode;
    }
    totalOffset += textNode.length;
  }

  return -1;
};

/**
 * Calculates the total offset for an element node within the container's text content.
 * Handles cases like triple-click selections where the range boundary is an element.
 * https://github.com/examind-ai/react-anchored-comments/issues/2
 * @param element - The container element.
 * @param targetNode - The element node to find the offset for.
 * @param offsetInNode - The child index within the element node.
 * @returns The total offset in the element's text content.
 */
const getOffsetForElementNode = (
  element: Element,
  targetNode: Node,
  offsetInNode: number,
): number => {
  const textNodes = getTextNodesInElement(element);
  let totalOffset = 0;

  // offsetInNode represents the child index in the element
  if (offsetInNode === 0) {
    // Position is before the first child - find where targetNode starts
    for (const textNode of textNodes) {
      if (targetNode.contains(textNode)) return totalOffset;

      const position = targetNode.compareDocumentPosition(textNode);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING)
        return totalOffset;

      totalOffset += textNode.length;
    }
    return totalOffset;
  }

  // Position is after the nth child
  const childNode = targetNode.childNodes[offsetInNode - 1];
  if (!childNode) return totalOffset;

  for (const textNode of textNodes) {
    if (childNode.contains(textNode) || childNode === textNode) {
      totalOffset += textNode.length;
      return totalOffset;
    }
    totalOffset += textNode.length;
  }

  return totalOffset;
};

/**
 * Calculates the total offset of a target node within an element's text content.
 * @param element - The container element.
 * @param targetNode - The node to find the offset for (text node or element node).
 * @param offsetInNode - The offset within the target node.
 * @returns The total offset in the element's text content, or -1 if not found.
 */
export const getOffsetInTextContent = (
  element: Element,
  targetNode: Node,
  offsetInNode: number,
): number => {
  if (targetNode.nodeType === Node.ELEMENT_NODE)
    return getOffsetForElementNode(element, targetNode, offsetInNode);

  return getOffsetForTextNode(element, targetNode, offsetInNode);
};

/**
 * Finds the text node and offset within that node given a total offset in the element's text content.
 * @param element - The container element.
 * @param targetOffset - The total offset to find.
 * @returns An object containing the found text node and offset within it, or null if not found.
 */
export const findNodeAndOffsetFromTotalOffset = (
  element: Element,
  targetOffset: number,
): { node: Text; offset: number } | null => {
  const textNodes = getTextNodesInElement(element);
  let currentOffset = 0;

  for (const textNode of textNodes) {
    if (currentOffset + textNode.length > targetOffset) {
      return {
        node: textNode,
        offset: targetOffset - currentOffset,
      };
    }
    currentOffset += textNode.length;
  }

  // If we've gone through all nodes and haven't found the offset,
  // return the last text node and its length
  if (textNodes.length > 0) {
    const lastTextNode = textNodes[textNodes.length - 1];
    return {
      node: lastTextNode,
      offset: lastTextNode.length,
    };
  }

  return null; // No text nodes found
};
