/**
 * Digital sequence puzzle domain model.
 * Consolidates input validation, trail graph building, DFS solving, and sequence reconstruction.
 */

export { parseAndValidateInput } from './validator.js';
export {
  buildTrailGraph,
  reconstructSequence,
  validateSequence,
  solveLongestChain,
} from './solver.js';
