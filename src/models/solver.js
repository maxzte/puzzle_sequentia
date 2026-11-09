/**
 * Digital sequence puzzle solver.
 * 
 * Rules:
 * - Fragments connect sequentially where the last 2 digits of fragment A
 *   match the first 2 digits of fragment B.
 * - Each fragment from the input list can be used at most once.
 * - Finds the longest chain of fragments.
 */

/**
 * Builds directed trail graph where nodes are 2-digit prefixes/suffixes
 * and edges are the fragments.
 * 
 * @param {string[]} fragments
 * @returns {{
 *   nodeEdges: Map<string, Array<{ target: string, edgeIdx: number }>>,
 *   inDegree: Map<string, number>,
 *   outDegree: Map<string, number>,
 *   startNodes: string[]
 * }}
 */
export function buildTrailGraph(fragments) {
  const nodeEdges = new Map();
  const inDegree = new Map();
  const outDegree = new Map();

  for (let i = 0; i < fragments.length; i++) {
    const w = fragments[i];
    const u = w.slice(0, 2);
    const v = w.slice(-2);

    if (!nodeEdges.has(u)) nodeEdges.set(u, []);
    nodeEdges.get(u).push({ target: v, edgeIdx: i });

    outDegree.set(u, (outDegree.get(u) || 0) + 1);
    inDegree.set(v, (inDegree.get(v) || 0) + 1);
    if (!inDegree.has(u)) inDegree.set(u, 0);
    if (!outDegree.has(v)) outDegree.set(v, 0);
  }

  // Sort edges by heuristic: prioritize target nodes with higher out-degree
  // to avoid getting stuck in premature dead-ends.
  for (const [, edges] of nodeEdges.entries()) {
    edges.sort((a, b) => {
      const outA = outDegree.get(a.target) || 0;
      const outB = outDegree.get(b.target) || 0;
      return outB - outA;
    });
  }

  // Prioritize start nodes with outDegree > inDegree or higher outDegree
  const startNodes = Array.from(nodeEdges.keys()).sort((a, b) => {
    const diffA = (outDegree.get(a) || 0) - (inDegree.get(a) || 0);
    const diffB = (outDegree.get(b) || 0) - (inDegree.get(b) || 0);
    if (diffA !== diffB) return diffB - diffA;
    return (outDegree.get(b) || 0) - (outDegree.get(a) || 0);
  });

  return { nodeEdges, inDegree, outDegree, startNodes };
}

/**
 * Reconstructs the concatenated sequence string from a chain of fragment indices.
 * Overlaps each adjacent pair by 2 digits: w[0] + w[1][2:] + w[2][2:] + ...
 * 
 * @param {number[]} chainIndices
 * @param {string[]} fragments
 * @returns {string}
 */
export function reconstructSequence(chainIndices, fragments) {
  if (!chainIndices || chainIndices.length === 0) return '';
  let result = fragments[chainIndices[0]];
  for (let i = 1; i < chainIndices.length; i++) {
    result += fragments[chainIndices[i]].slice(2);
  }
  return result;
}

/**
 * Validates whether a sequence of fragments satisfies the 2-digit overlap constraint.
 * 
 * @param {number[]} chainIndices
 * @param {string[]} fragments
 * @returns {boolean}
 */
export function validateSequence(chainIndices, fragments) {
  if (!chainIndices || chainIndices.length === 0) return true;
  for (let i = 0; i < chainIndices.length - 1; i++) {
    const curr = fragments[chainIndices[i]];
    const next = fragments[chainIndices[i + 1]];
    if (curr.slice(-2) !== next.slice(0, 2)) {
      return false;
    }
  }
  return true;
}

/**
 * Solves the longest chain puzzle using an Anytime Branch-and-Bound DFS.
 * 
 * @param {string[]} fragments
 * @param {Object} [options]
 * @param {(update: { count: number, result: string, length: number }) => void} [options.onProgress]
 * @param {{ aborted?: boolean }} [options.signal]
 * @param {number} [options.maxIterations]
 * @returns {{
 *   chain: number[],
 *   result: string,
 *   count: number,
 *   length: number,
 *   completed: boolean
 * }}
 */
export function solveLongestChain(fragments, options = {}) {
  const { onProgress, signal, maxIterations = Infinity } = options;
  const N = fragments.length;
  if (N === 0) {
    return { chain: [], result: '', count: 0, length: 0, completed: true };
  }

  const { nodeEdges, startNodes } = buildTrailGraph(fragments);
  const used = new Uint8Array(N);
  const currentTrail = [];
  let bestTrail = [];
  let iterations = 0;
  let isAborted = false;

  function reportBest() {
    if (onProgress && bestTrail.length > 0) {
      const result = reconstructSequence(bestTrail, fragments);
      onProgress({
        count: bestTrail.length,
        result,
        length: result.length,
      });
    }
  }

  function dfs(u) {
    if (signal?.aborted || iterations >= maxIterations) {
      isAborted = true;
      return;
    }
    iterations++;

    if (currentTrail.length > bestTrail.length) {
      bestTrail = currentTrail.slice();
      reportBest();
    }

    const edges = nodeEdges.get(u);
    if (!edges || edges.length === 0) return;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      if (used[edge.edgeIdx] === 0) {
        used[edge.edgeIdx] = 1;
        currentTrail.push(edge.edgeIdx);

        dfs(edge.target);

        currentTrail.pop();
        used[edge.edgeIdx] = 0;

        if (isAborted) return;
      }
    }
  }

  for (let i = 0; i < startNodes.length; i++) {
    if (signal?.aborted || isAborted) break;
    dfs(startNodes[i]);
  }

  const finalResult = reconstructSequence(bestTrail, fragments);
  return {
    chain: bestTrail,
    result: finalResult,
    count: bestTrail.length,
    length: finalResult.length,
    completed: !isAborted && !signal?.aborted,
  };
}

