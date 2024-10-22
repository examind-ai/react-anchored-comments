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
 * Calculates the total offset of a target node within an element's text content.
 * @param element - The container element.
 * @param targetNode - The specific node to find the offset for.
 * @param offsetInNode - The offset within the target node.
 * @returns The total offset in the element's text content, or -1 if not found.
 */
export const getOffsetInTextContent = (
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

  return -1; // Should never happen if targetNode is within element
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
