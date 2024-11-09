import { Positions } from '../types';

/**
 * Calculates adjusted top positions for comments to prevent overlaps in the UI.
 *
 * **Description:**
 * This function ensures that comments are displayed without overlapping by adjusting their
 * top positions based on their desired locations and heights. It prioritizes the active
 * comment, keeping it at its desired position while minimally adjusting surrounding comments
 * to maintain readability and proximity to their associated text.
 *
 * **Parameters:**
 * - `textPositions: Record<string, { top: number }>`: Maps each comment ID to its desired top position.
 * - `activeCommentId: string | null`: The ID of the currently active (focused) comment, or `null` if none.
 * - `visibleComments: Set<string>`: A set of comment IDs that are currently visible in the UI.
 * - `commentHeights: Record<string, number>`: Maps each comment ID to its height in pixels.
 *
 * **Returns:**
 * - `Positions`: An object mapping each visible comment ID to its adjusted top position.
 *
 * **Behavior:**
 * - **Without an Active Comment:**
 *   - Sorts comments by their desired top positions.
 *   - Iterates from top to bottom, adjusting each comment downward only if it overlaps with the previous one.
 *
 * - **With an Active Comment:**
 *   - Keeps the active comment at its desired position.
 *   - Adjusts comments above the active comment upwards as necessary, prioritizing higher comments to minimize shifts.
 *   - Adjusts comments below the active comment downward to prevent overlaps.
 *
 * **Key Considerations:**
 * - Ensures minimal movement of comments to maintain their association with the text.
 * - Prevents comments from moving above a defined minimum top limit (e.g., 0px).
 * - Handles multiple overlapping comments by iteratively adjusting positions to resolve conflicts.
 *
 * **Usage:**
 * This function is essential for rendering a clean and user-friendly comments section,
 * especially in applications that mimic collaborative tools like Google Docs.
 */

export const calculatePositions = (
  textPositions: Record<string, { top: number }>,
  activeCommentId: string | null,
  visibleComments: Set<string>,
  commentHeights: Record<string, number>,
  commentOverlapGap: number,
): Positions => {
  const newPositions: Positions = {};

  // Filter and sort comments by their desired positions
  const sortedComments = Object.entries(textPositions)
    .filter(([id]) => visibleComments.has(id))
    .sort(([, a], [, b]) => a.top - b.top);

  const finalPositions: Record<string, number> = {};

  const getCommentHeight = (id: string) => commentHeights[id] ?? 0;

  if (activeCommentId && textPositions[activeCommentId]) {
    // **Case 1: Active Comment Present**

    const activeIndex = sortedComments.findIndex(
      ([id]) => id === activeCommentId,
    );
    const activeTop = textPositions[activeCommentId].top;

    // **First Pass: Assign positions to comments above the active comment**
    for (let i = 0; i < activeIndex; i++) {
      const [currentId] = sortedComments[i];
      const desiredTop = textPositions[currentId].top;

      if (i === 0) {
        // First comment, place at desired position
        finalPositions[currentId] = desiredTop;
      } else {
        const prevId = sortedComments[i - 1][0];
        const prevTop = finalPositions[prevId];
        const prevHeight = getCommentHeight(prevId);

        // Calculate the minimum top position to prevent overlap with previous comment
        const minTop = prevTop + prevHeight + commentOverlapGap;

        // Adjust current comment's position downwards as needed
        const adjustedTop = Math.max(desiredTop, minTop);

        finalPositions[currentId] = adjustedTop;
      }
    }

    // **Set the active comment's position**
    finalPositions[activeCommentId] = activeTop;

    // **First Pass: Assign positions to comments below the active comment**
    for (let i = activeIndex + 1; i < sortedComments.length; i++) {
      const [currentId] = sortedComments[i];
      const desiredTop = textPositions[currentId].top;

      const prevId = sortedComments[i - 1][0];
      const prevTop = finalPositions[prevId];
      const prevHeight = getCommentHeight(prevId);

      // Calculate the minimum top position to prevent overlap
      const minTop = prevTop + prevHeight + commentOverlapGap;

      // Adjust current comment's position downwards as needed
      const adjustedTop = Math.max(desiredTop, minTop);

      finalPositions[currentId] = adjustedTop;
    }

    // **Second Pass: Adjust comments above the active comment if necessary**
    for (let i = activeIndex - 1; i >= 0; i--) {
      let [currentId] = sortedComments[i];
      let currentTop = finalPositions[currentId];
      let currentHeight = getCommentHeight(currentId);

      const nextId =
        i === activeIndex - 1
          ? activeCommentId
          : sortedComments[i + 1][0];
      const nextTop = finalPositions[nextId];

      // Check for overlap with the comment below
      let overlap =
        currentTop + currentHeight + commentOverlapGap > nextTop;

      if (overlap) {
        // Adjust upwards as little as possible to prevent overlap
        currentTop = nextTop - currentHeight - commentOverlapGap;
        finalPositions[currentId] = currentTop;

        // Propagate adjustment upwards if necessary
        let j = i - 1;
        while (j >= 0) {
          const [aboveId] = sortedComments[j];
          let aboveTop = finalPositions[aboveId];
          const aboveHeight = getCommentHeight(aboveId);

          // Check for overlap
          overlap =
            aboveTop + aboveHeight + commentOverlapGap > currentTop;

          if (overlap) {
            // Adjust the above comment upwards
            aboveTop = currentTop - aboveHeight - commentOverlapGap;
            finalPositions[aboveId] = aboveTop;

            // Move up the chain
            currentId = aboveId;
            currentTop = aboveTop;
            j--;
          } else {
            // No overlap with the above comment, break
            break;
          }
        }
      }
    }
  } else {
    // **Case 2: No Active Comment**

    // Adjust positions from top to bottom
    for (let i = 0; i < sortedComments.length; i++) {
      const [currentId] = sortedComments[i];
      const desiredTop = textPositions[currentId].top;

      if (i === 0) {
        // First comment, place at desired position
        finalPositions[currentId] = desiredTop;
      } else {
        const prevId = sortedComments[i - 1][0];
        const prevTop = finalPositions[prevId];
        const prevHeight = getCommentHeight(prevId);

        // Calculate the minimum top position to prevent overlap
        const minTop = prevTop + prevHeight + commentOverlapGap;

        // Adjust current comment's position downwards as needed
        const adjustedTop = Math.max(desiredTop, minTop);

        finalPositions[currentId] = adjustedTop;
      }
    }
  }

  // Set the new positions
  Object.entries(finalPositions).forEach(([id, top]) => {
    newPositions[id] = { top };
  });

  return newPositions;
};
