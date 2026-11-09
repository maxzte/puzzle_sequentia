/**
 * Emergency Error Boundary Fallback View.
 * Renders an accessible, unrecoverable crash screen if fatal initialization or renderer errors occur.
 */

export class ErrorBoundaryView {
  /**
   * Renders a full fatal crash overlay into the document.
   * 
   * @param {Object} errorEntry - Log entry from ErrorLogger
   */
  showFatalCrash(errorEntry) {
    if (typeof document === 'undefined') return;

    // Remove existing crash overlay if present
    const existing = document.getElementById('fatal-crash-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'fatal-crash-overlay';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'fatal-crash-title');

    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background-color: oklch(0.12 0.02 260 / 0.98);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      font-family: system-ui, -apple-system, sans-serif;
      color: oklch(0.96 0.01 260);
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      max-width: 600px;
      width: 100%;
      background-color: oklch(0.18 0.02 260);
      border: 1px solid oklch(0.45 0.15 25);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    `;

    const title = document.createElement('h1');
    title.id = 'fatal-crash-title';
    title.textContent = '⚠️ Application Encountered an Unexpected Error';
    title.style.cssText = 'font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; color: oklch(0.85 0.15 25);';

    const desc = document.createElement('p');
    desc.textContent = errorEntry.message || 'An unknown fatal error prevented the application from rendering.';
    desc.style.cssText = 'font-size: 0.95rem; margin-bottom: 1.25rem; line-height: 1.5; color: oklch(0.8 0.02 260);';

    const stackPre = document.createElement('pre');
    stackPre.textContent = errorEntry.stack || errorEntry.message || 'No stack trace.';
    stackPre.style.cssText = `
      background-color: oklch(0.1 0.02 260);
      border: 1px solid oklch(0.28 0.02 260);
      border-radius: 6px;
      padding: 0.75rem;
      font-family: monospace;
      font-size: 0.8rem;
      overflow-x: auto;
      max-height: 180px;
      margin-bottom: 1.5rem;
      color: oklch(0.7 0.02 260);
    `;

    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 0.75rem; flex-wrap: wrap;';

    const reloadBtn = document.createElement('button');
    reloadBtn.textContent = '🔄 Reload Application';
    reloadBtn.style.cssText = `
      padding: 0.6rem 1.2rem;
      background-color: oklch(0.62 0.19 255);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    `;
    reloadBtn.onclick = () => {
      globalThis.location?.reload();
    };

    const issueLink = document.createElement('a');
    issueLink.textContent = '🐙 Open GitHub Issue';
    issueLink.href = 'https://github.com/issues';
    issueLink.target = '_blank';
    issueLink.rel = 'noopener noreferrer';
    issueLink.style.cssText = `
      padding: 0.6rem 1.2rem;
      background-color: oklch(0.28 0.02 260);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
    `;

    actions.appendChild(reloadBtn);
    actions.appendChild(issueLink);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(stackPre);
    card.appendChild(actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }
}

export const errorBoundaryView = new ErrorBoundaryView();

