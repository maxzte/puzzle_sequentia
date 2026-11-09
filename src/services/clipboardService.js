/**
 * Copies text to the user clipboard.
 * Uses navigator.clipboard with self-contained fallback for restricted environments.
 *
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyTextToClipboard(text) {
  if (!text) return false;

  // 1. Modern Async Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_err) {
      // Fall through to legacy fallback
    }
  }

  // 2. Self-contained fallback using temporary textarea
  if (typeof document !== 'undefined') {
    try {
      const tempArea = document.createElement('textarea');
      tempArea.value = text;
      tempArea.setAttribute('readonly', '');
      tempArea.style.position = 'fixed';
      tempArea.style.left = '-9999px';
      tempArea.style.top = '-9999px';
      document.body.appendChild(tempArea);
      tempArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(tempArea);
      return success;
    } catch (_err) {
      return false;
    }
  }

  return false;
}
