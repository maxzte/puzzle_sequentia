/**
 * Client-side error logging & diagnostics service.
 * Records errors to an in-memory buffer and sessionStorage without external telemetry.
 */

const STORAGE_KEY = 'puzzle_error_logs';
const MAX_LOGS = 20;

export class ErrorLogger {
  constructor() {
    /** @type {Array<Object>} */
    this.logs = this.loadLogs();
  }

  /**
   * Loads persisted logs from sessionStorage.
   * @returns {Array<Object>}
   */
  loadLogs() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (_err) {
      // Storage unavailable or disabled
    }
    return [];
  }

  /**
   * Persists logs to sessionStorage.
   */
  saveLogs() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
      }
    } catch (_err) {
      // Storage quota exceeded or disabled
    }
  }

  /**
   * Records an error event into the diagnostic buffer.
   * 
   * @param {Error | string} error
   * @param {Object} [context={}]
   * @returns {Object} The recorded log entry
   */
  recordError(error, context = {}) {
    const isErrorObj = error instanceof Error;
    const message = isErrorObj ? error.message : String(error);
    const stack = isErrorObj ? error.stack || '' : '';

    const entry = {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      message,
      stack,
      context: {
        ...context,
      },
      environment: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node/Deno',
        language: typeof navigator !== 'undefined' ? navigator.language : 'en',
        url: typeof globalThis.location !== 'undefined' ? globalThis.location?.href : '',
      },
    };

    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(0, MAX_LOGS);
    }

    this.saveLogs();
    return entry;
  }

  /**
   * Attaches global unhandled error handlers.
   * 
   * @param {(entry: Object) => void} [onUnhandled]
   */
  initGlobalHandlers(onUnhandled) {
    if (typeof globalThis.addEventListener !== 'function') return;

    globalThis.addEventListener('error', (event) => {
      const entry = this.recordError(event.error || event.message, { type: 'uncaught_error' });
      onUnhandled?.(entry);
    });

    globalThis.addEventListener('unhandledrejection', (event) => {
      const entry = this.recordError(event.reason || 'Unhandled Promise rejection', {
        type: 'unhandled_rejection',
      });
      onUnhandled?.(entry);
    });
  }

  /**
   * Returns current log entries.
   * @returns {Array<Object>}
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Formats the most recent error into a Markdown template suitable for GitHub Issues.
   * 
   * @param {Object} [targetEntry]
   * @returns {string}
   */
  formatErrorReportMarkdown(targetEntry) {
    const entry = targetEntry || this.logs[0];
    if (!entry) {
      return 'No diagnostic errors recorded.';
    }

    return [
      `### Bug Report / Diagnostic Log`,
      `**Timestamp:** \`${entry.timestamp}\``,
      `**Error Message:** \`${entry.message}\``,
      ``,
      `#### Environment`,
      `- **User-Agent:** ${entry.environment?.userAgent || 'Unknown'}`,
      `- **Language:** ${entry.environment?.language || 'Unknown'}`,
      `- **URL:** ${entry.environment?.url || 'Unknown'}`,
      ``,
      `#### Context`,
      '```json',
      JSON.stringify(entry.context || {}, null, 2),
      '```',
      ``,
      `#### Stack Trace`,
      '```text',
      entry.stack || 'No stack trace available.',
      '```',
    ].join('\n');
  }

  /**
   * Generates and triggers download of a full diagnostic JSON report.
   * 
   * @param {string} [filename='puzzle-diagnostic-report.json']
   */
  downloadDiagnosticJson(filename = 'puzzle-diagnostic-report.json') {
    if (typeof document === 'undefined') return;

    const data = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalErrors: this.logs.length,
        logs: this.logs,
      },
      null,
      2
    );

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const errorLogger = new ErrorLogger();
