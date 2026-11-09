import { Store } from '../models/store.js';
import { View } from '../views/appView.js';
import { SolverService } from '../services/solverService.js';
import { readFileContent, fetchSampleDataset } from '../services/fileService.js';
import { copyTextToClipboard } from '../services/clipboardService.js';
import { errorLogger } from '../services/errorLogger.js';
import { parseAndValidateInput } from '../models/puzzleModel.js';

/**
 * Main Application Controller (MVC).
 * Orchestrates Store updates, View rendering subscriptions, and Service invocations.
 */
export class AppController {
  constructor() {
    this.store = new Store();
    this.view = new View();
    this.solverService = new SolverService();
  }

  /**
   * Initializes application bindings and triggers the initial render.
   */
  init() {
    // Connect View to Store (Unidirectional Data Flow)
    this.store.subscribe((state) => {
      this.view.render(state);
    });

    // Initial render
    this.view.render(this.store.getState());

    // Bind User Interaction Events
    this.view.bindEvents({
      onFileSelected: (file) => this.handleFileSelected(file),
      onTextInput: (text) => this.handleTextInput(text),
      onLoadSample: () => this.handleLoadSample(),
      onSolve: () => this.handleSolve(),
      onStop: () => this.handleStop(),
      onCopy: () => this.handleCopyResult(),
      onCopyError: () => this.handleCopyErrorReport(),
      onDownloadError: () => this.handleDownloadDiagnostics(),
    });
  }

  /**
   * Processes and validates raw input text.
   * 
   * @param {string} rawText
   * @param {string} sourceLabel
   */
  processInputText(rawText, sourceLabel) {
    const trimmed = rawText.trim();
    if (!trimmed) {
      this.store.clearInput();
      return;
    }

    const validation = parseAndValidateInput(trimmed);
    if (validation.success) {
      this.store.setInputFragments(validation.fragments, sourceLabel);
    } else {
      // Validation error: does not trigger system diagnostic error logging
      this.store.setError(validation.error, 'validation');
    }
  }

  /**
   * Handles user file selection or drag-and-drop.
   * 
   * @param {File} file
   */
  async handleFileSelected(file) {
    try {
      this.store.startLoading(`Reading "${file.name}"...`);
      const content = await readFileContent(file);
      this.processInputText(content, `file "${file.name}"`);
    } catch (err) {
      errorLogger.recordError(err, { action: 'read_file', fileName: file?.name });
      this.store.setError(`Failed to read file: ${err.message}`);
    }
  }

  /**
   * Handles manual textarea input.
   * 
   * @param {string} text
   */
  handleTextInput(text) {
    this.processInputText(text, 'manual input');
  }

  /**
   * Loads sample dataset from static file.
   */
  async handleLoadSample() {
    try {
      this.store.startLoading('Fetching sample puzzle (142 fragments)...');
      const text = await fetchSampleDataset('sample.txt');
      this.view.setManualText(text);
      this.processInputText(text, 'sample puzzle (142 fragments)');
    } catch (err) {
      errorLogger.recordError(err, { action: 'load_sample' });
      this.store.setError(`Failed to load sample: ${err.message}`);
    }
  }

  /**
   * Starts solver execution in background Web Worker.
   */
  handleSolve() {
    const { fragments } = this.store.getState();
    if (!fragments || fragments.length === 0) return;

    this.store.startSolving();

    this.solverService.start(fragments, {
      onProgress: (data) => {
        this.store.updateProgress(data);
      },
      onDone: (final) => {
        this.store.finishSolving(final);
      },
      onError: (err) => {
        errorLogger.recordError(err, { action: 'solver', fragmentsCount: fragments.length });
        this.store.setError(`Solver error: ${err.message}`);
      },
    });
  }

  /**
   * Stops background solver worker.
   */
  handleStop() {
    this.solverService.stop();
    this.store.stopSolving();
  }

  /**
   * Copies result string to clipboard.
   */
  async handleCopyResult() {
    const { result } = this.store.getState();
    if (!result) return;

    const success = await copyTextToClipboard(result);
    if (success) {
      this.store.setCopied(true);
      setTimeout(() => {
        this.store.setCopied(false);
      }, 2000);
    }
  }

  /**
   * Copies formatted diagnostic report markdown.
   */
  async handleCopyErrorReport() {
    const markdown = errorLogger.formatErrorReportMarkdown();
    const success = await copyTextToClipboard(markdown);
    if (success) {
      this.store.setErrorCopied(true);
      setTimeout(() => {
        this.store.setErrorCopied(false);
      }, 2000);
    }
  }

  /**
   * Triggers download of diagnostic JSON.
   */
  handleDownloadDiagnostics() {
    errorLogger.downloadDiagnosticJson();
  }
}

