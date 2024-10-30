import { COMMENT_OVERLAP_GAP } from '../constants';
import { Positions } from '../types';

/**
 * Calculates the adjusted positions of comments to be displayed in the UI.
 *
 * **Strategy Overview:**
 *
 * - **Desired Positions:** Each comment has a desired top position based on the location of its associated text selection in the document (`textPositions[id].top`).
 * - **Overlap Prevention:** Comments may overlap if their desired positions are close. The goal is to adjust their positions to prevent overlap while keeping them as close as possible to their desired positions.
 * - **Active Comment Priority:** If there's an active (focused) comment, it should remain at its desired position. Other comments adjust around it to prevent overlap, but they should not stray far from their own desired positions.
 * - **Minimal Adjustment:** Adjust comments only when necessary and by the minimal amount required to prevent overlap. Adjustments are limited to overlapping comments.
 *
 * **Function Inputs:**
 *
 * - `textPositions: Record<string, { top: number }>`: An object mapping comment IDs to their desired top positions.
 * - `activeCommentId: string | null`: The ID of the currently active comment, or `null` if no comment is active.
 * - `visibleComments: Set<string>`: A set of comment IDs that are currently visible in the UI.
 * - `commentHeights: Record<string, number>`: An object mapping comment IDs to their heights.
 *
 * **Function Output:**
 *
 * - `newPositions: Positions`: An object mapping comment IDs to their adjusted positions (`{ [id]: { top: number } }`).
 *
 * **Algorithm Steps:**
 *
 * 1. **Filter and Sort Comments:**
 *    - Filter out comments that are not visible.
 *    - Sort the remaining comments by their desired top positions in ascending order.
 *
 * 2. **Assign Desired Positions:**
 *    - Initialize `finalPositions` by assigning each comment its desired top position from `textPositions`.
 *
 * 3. **Adjust Positions to Prevent Overlap (No Active Comment):**
 *    - If there's no active comment, iterate through the sorted comments.
 *    - For each comment (except the first), check if it overlaps with the previous comment.
 *    - If an overlap is detected, adjust the current comment's position downward to sit just below the previous comment, respecting the `COMMENT_OVERLAP_GAP`.
 *
 * 4. **Handle Active Comment:**
 *    - If there's an active comment:
 *      - **Keep the active comment at its desired position.**
 *      - **Adjust Comments Above the Active Comment:**
 *        - Iterate backward from the comment just above the active comment.
 *        - For each comment:
 *          - Calculate the maximum allowable top position (`requiredTop`) to prevent overlap with the comment below it.
 *          - Adjust the comment's position upward to the minimum of its desired position and `requiredTop`, ensuring it doesn't move above its desired position.
 *          - **Early Exit:** If no overlap is detected, break out of the loop to prevent unnecessary adjustments.
 *      - **Adjust Comments Below the Active Comment:**
 *        - Iterate forward from the comment just below the active comment.
 *        - For each comment:
 *          - Calculate the minimum allowable top position (`requiredTop`) to prevent overlap with the comment above it.
 *          - Adjust the comment's position downward to the maximum of its desired position and `requiredTop`, ensuring it doesn't move below its desired position.
 *          - **Early Exit:** Similarly, break out of the loop if no overlap is detected.
 *
 * 5. **Finalize Adjusted Positions:**
 *    - Compile the adjusted positions into `newPositions`.
 *
 * **Key Considerations:**
 *
 * - **Desired Position vs. Adjusted Position:**
 *   - The desired position is where the comment would naturally appear next to its associated text.
 *   - The adjusted position is where the comment is actually placed after adjustments to prevent overlap.
 * - **Overlap Detection and Early Exit:**
 *   - Overlaps are detected by comparing the positions and heights of adjacent comments.
 *   - The algorithm minimizes adjustments by only altering positions when an overlap is detected.
 *   - The loops exit early when further comments do not overlap, preventing unnecessary computations.
 * - **Minimal Movement:**
 *   - Comments are only moved as much as necessary to prevent overlap.
 *   - Adjustments do not push comments beyond their desired positions unless required.
 *
 * **Why This Approach:**
 *
 * - **User Experience:**
 *   - Keeping comments near their associated text enhances the user's understanding of what part of the text each comment refers to.
 *   - Preventing overlap ensures that comments are readable and accessible.
 * - **Active Comment Focus:**
 *   - Prioritizing the active comment's position maintains context for the user and avoids unexpected movements during interaction.
 *   - Limiting adjustments to overlapping comments preserves the stability of other comments.
 *
 * **Example Scenario:**
 *
 * - **Initial State:**
 *   - Comment 1 at top position 100px (height 50px).
 *   - Comment 2 at top position 140px (height 50px).
 *   - Comment 3 at top position 180px (height 50px).
 * - **Overlap Detection:**
 *   - Comment 2 would overlap with Comment 1 (since 100px + 50px + gap > 140px).
 * - **Adjustment:**
 *   - Adjust Comment 2 to start at 100px + 50px + gap.
 *   - Repeat for Comment 3.
 * - **Active Comment:**
 *   - If Comment 2 becomes active, it stays at 140px.
 *   - Comments above adjust if they overlap with Comment 2.
 *   - Comments below adjust if they overlap with Comment 2.
 *   - Adjustments stop once no overlap is detected, leaving distant comments unaffected.
 *
 * **Dependencies:**
 *
 * - Relies on accurate `commentHeights` to calculate heights.
 * - Assumes `textPositions` contains up-to-date desired positions based on text selections.
 */

export const calculatePositions = (
  textPositions: Record<string, { top: number }>,
  activeCommentId: string | null,
  visibleComments: Set<string>,
  commentHeights: Record<string, number>,
): Positions => {
  const newPositions: Positions = {};

  // Filter and sort comments by their desired positions
  const sortedComments = Object.entries(textPositions)
    .filter(([id]) => visibleComments.has(id))
    .sort(([, a], [, b]) => a.top - b.top);

  // Map to store final positions
  const finalPositions: Record<string, number> = {};

  // Helper function to get comment height
  const getCommentHeight = (id: string) => commentHeights[id] ?? 0;

  if (activeCommentId && textPositions[activeCommentId]) {
    // **Case 1: No Active Comment**

    const activeIndex = sortedComments.findIndex(
      ([id]) => id === activeCommentId,
    );
    const activeTop = textPositions[activeCommentId].top;

    // Set the active comment's position
    finalPositions[activeCommentId] = activeTop;

    // **Adjust comments above the active comment**
    for (let i = activeIndex - 1; i >= 0; i--) {
      const [currentId] = sortedComments[i];
      const desiredTop = textPositions[currentId].top;
      const currentHeight = getCommentHeight(currentId);

      const nextId = sortedComments[i + 1][0];
      const nextTop = finalPositions[nextId];

      // Calculate the maximum top position to prevent overlap
      const maxTop = nextTop - currentHeight - COMMENT_OVERLAP_GAP;

      // Adjust current comment's position upwards as needed, but do not move above desiredTop
      const adjustedTop = Math.min(desiredTop, maxTop);

      finalPositions[currentId] = adjustedTop;
    }

    // **Adjust comments below the active comment**
    for (let i = activeIndex + 1; i < sortedComments.length; i++) {
      const [currentId] = sortedComments[i];
      const desiredTop = textPositions[currentId].top;

      const prevId = sortedComments[i - 1][0];
      const prevTop = finalPositions[prevId];
      const prevHeight = getCommentHeight(prevId);

      // Calculate the minimum top position to prevent overlap
      const minTop = prevTop + prevHeight + COMMENT_OVERLAP_GAP;

      // Adjust current comment's position downwards as needed, but do not move below desiredTop
      const adjustedTop = Math.max(desiredTop, minTop);

      finalPositions[currentId] = adjustedTop;
    }
  } else {
    // **Case 2: Active Comment Present**

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
        const minTop = prevTop + prevHeight + COMMENT_OVERLAP_GAP;

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
