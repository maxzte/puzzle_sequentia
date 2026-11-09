/**
 * Validates and parses raw text input containing numeric fragments.
 * 
 * Rules:
 * - Splits input by line breaks (\n or \r\n).
 * - Ignores empty or whitespace-only lines.
 * - Each non-empty line must consist strictly of digits (0-9).
 * - Each fragment must have at least 2 digits to allow prefix/suffix chaining.
 * 
 * @param {string} text - Raw text from file or textarea
 * @returns {{ success: true, fragments: string[] } | { success: false, error: string, line?: number }}
 */
export function parseAndValidateInput(text) {
  if (typeof text !== 'string') {
    return { success: false, error: 'Input must be a string.' };
  }

  const rawLines = text.split(/\r?\n/);
  const fragments = [];

  for (let i = 0; i < rawLines.length; i++) {
    const lineNumber = i + 1;
    const line = rawLines[i].trim();

    if (!line) {
      continue; // Skip blank lines
    }

    if (!/^\d+$/.test(line)) {
      return {
        success: false,
        error: `Invalid character on line ${lineNumber}: "${line}". Each line must contain digits only.`,
        line: lineNumber,
      };
    }

    if (line.length < 2) {
      return {
        success: false,
        error: `Fragment on line ${lineNumber} ("${line}") is too short. Each fragment must be at least 2 digits long.`,
        line: lineNumber,
      };
    }

    fragments.push(line);
  }

  if (fragments.length < 2) {
    return {
      success: false,
      error: fragments.length === 0
        ? 'The input is empty. Please provide at least two numeric fragments.'
        : 'A puzzle requires at least 2 numeric fragments to assemble a sequence. Please provide at least two numbers.',
    };
  }

  return {
    success: true,
    fragments,
  };
}

