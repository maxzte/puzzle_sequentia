/**
 * Pure presentation layer (View).
 * Responsible for caching DOM elements, declaratively rendering state,
 * and exposing user interaction events.
 */

export class View {
  constructor() {
    // Input elements
    this.dropZone = document.getElementById("drop-zone");
    this.dropContent = document.getElementById("drop-content");
    this.dropLoading = document.getElementById("drop-loading");
    this.dropLoadingText = document.getElementById("drop-loading-text");
    this.fileInput = document.getElementById("file-input");
    this.manualDetails = document.getElementById("manual-details");
    this.manualTextarea = document.getElementById("manual-textarea");
    this.btnLoadSample = document.getElementById("btn-load-sample");
    this.btnClear = document.getElementById("btn-clear");
    this.btnSolve = document.getElementById("btn-solve");
    this.btnStop = document.getElementById("btn-stop");
    this.inputSummary = document.getElementById("input-summary");
    this.summaryText = document.getElementById("summary-text");
    this.errorAlert = document.getElementById("error-alert");
    this.errorText = document.getElementById("error-text");
    this.errorActions = document.getElementById("error-actions");
    this.btnCopyError = document.getElementById("btn-copy-error");
    this.btnDownloadError = document.getElementById("btn-download-error");
    this.linkReportIssue = document.getElementById("link-report-issue");

    // Progress elements
    this.progressCard = document.getElementById("progress-card");
    this.badgeStatus = document.getElementById("badge-status");
    this.metricChainCount = document.getElementById("metric-chain-count");
    this.metricDigitsCount = document.getElementById("metric-digits-count");
    this.metricElapsed = document.getElementById("metric-elapsed");
    this.progressBarContainer = document.getElementById(
      "progress-bar-container",
    );
    this.progressBarFill = document.getElementById("progress-bar-fill");

    // Result elements
    this.resultCard = document.getElementById("result-card");
    this.resultOutput = document.getElementById("result-output");
    this.btnCopy = document.getElementById("btn-copy");
    this.resultFragmentsInfo = document.getElementById("result-fragments-info");
    this.resultDigitsInfo = document.getElementById("result-digits-info");
  }

  /**
   * Declaratively renders the entire application state into the DOM.
   * @param {import('../models/store.js').AppState} state
   */
  render(state) {
    // 1. Render Loading State (Drop Zone, Buttons, Inputs)
    if (state.status === "loading") {
      this.dropZone.setAttribute("aria-busy", "true");
      this.dropZone.classList.add("is-loading");
      this.dropContent.classList.add("hidden");
      this.dropLoading.classList.remove("hidden");
      this.dropLoadingText.textContent =
        state.loadingMessage || "Reading & parsing file...";
      this.btnLoadSample.disabled = true;
      this.manualTextarea.disabled = true;
      this.btnSolve.disabled = true;
    } else {
      this.dropZone.setAttribute("aria-busy", "false");
      this.dropZone.classList.remove("is-loading");
      this.dropContent.classList.remove("hidden");
      this.dropLoading.classList.add("hidden");
      this.btnLoadSample.disabled = false;
      this.manualTextarea.disabled = false;
    }

    // 1.1 Render Clear Button Visibility
    const hasUserData =
      state.fragments.length > 0 ||
      Boolean(this.manualTextarea?.value.trim()) ||
      state.status === "error";

    if (this.btnClear) {
      if (hasUserData) {
        this.btnClear.classList.remove("hidden");
        this.btnClear.disabled =
          state.status === "running" || state.status === "loading";
      } else {
        this.btnClear.classList.add("hidden");
      }
    }

    // 2. Render Error Alert
    if (state.errorMessage) {
      if (this.errorText) {
        this.errorText.textContent = state.errorMessage;
      } else {
        this.errorAlert.textContent = state.errorMessage;
      }

      // Show diagnostic export actions ONLY for system errors, NOT for regular input validation
      if (this.errorActions) {
        if (state.errorType === 'system') {
          this.errorActions.classList.remove('hidden');
        } else {
          this.errorActions.classList.add('hidden');
        }
      }

      this.errorAlert.classList.remove("hidden");
    } else {
      if (this.errorText) this.errorText.textContent = "";
      if (this.errorActions) this.errorActions.classList.add('hidden');
      this.errorAlert.classList.add("hidden");
    }

    // 3. Render Input Summary
    if (
      state.fragments.length > 0 &&
      state.status !== "error" &&
      state.status !== "loading"
    ) {
      this.summaryText.textContent = `Loaded ${state.fragments.length} fragments from ${state.sourceLabel || "input"}. Ready to solve!`;
      this.inputSummary.classList.remove("hidden");
    } else {
      this.inputSummary.classList.add("hidden");
    }

    // 4. Render Buttons (Solve / Stop)
    if (state.status === "running") {
      this.btnSolve.classList.add("hidden");
      this.btnStop.classList.remove("hidden");
    } else {
      this.btnSolve.classList.remove("hidden");
      this.btnStop.classList.add("hidden");
      this.btnSolve.disabled =
        state.status === "loading" || state.fragments.length < 2;

      // Update button label depending on whether result is already present
      if (
        state.status === "finished" ||
        (state.result && state.status !== "error")
      ) {
        this.btnSolve.textContent = "🔄 Re-solve Puzzle";
      } else {
        this.btnSolve.textContent = "▶ Solve Puzzle";
      }
    }

    // 4. Render Progress Card, Metrics & Progress Bar Fill
    if (
      state.status === "running" ||
      state.status === "finished" ||
      state.status === "stopped"
    ) {
      this.progressCard.classList.remove("hidden");
      this.metricChainCount.textContent = String(state.metrics.chainCount);
      this.metricDigitsCount.textContent = String(state.metrics.digitsCount);
      this.metricElapsed.textContent = state.metrics.elapsed || "0.0s";

      if (state.status === "running") {
        this.badgeStatus.textContent = "Running";
        this.badgeStatus.className = "badge badge-running";
        this.progressBarFill.className = "progress-bar-fill is-running";
        this.progressBarContainer.removeAttribute("aria-valuenow");
      } else if (state.status === "finished") {
        this.badgeStatus.textContent = "Finished";
        this.badgeStatus.className = "badge badge-done";
        this.progressBarFill.className = "progress-bar-fill is-finished";
        this.progressBarContainer.setAttribute("aria-valuenow", "100");
      } else if (state.status === "stopped") {
        this.badgeStatus.textContent = "Stopped";
        this.badgeStatus.className = "badge";
        this.progressBarFill.className = "progress-bar-fill is-stopped";
        this.progressBarContainer.setAttribute("aria-valuenow", "0");
      }
    } else {
      this.progressCard.classList.add("hidden");
    }

    // 5. Render Result Card
    if (state.result) {
      this.resultCard.classList.remove("hidden");
      this.resultOutput.value = state.result;
      this.resultFragmentsInfo.textContent = `${state.metrics.chainCount} fragments chained`;
      this.resultDigitsInfo.textContent = `${state.metrics.digitsCount} total digits`;
    } else {
      this.resultCard.classList.add("hidden");
    }

    // 6. Render Copy Button state
    if (state.copied) {
      this.btnCopy.textContent = "✅ Copied!";
    } else {
      this.btnCopy.textContent = "📋 Copy Result";
    }

    // 7. Render Error Diagnostic Copy Button state
    if (this.btnCopyError) {
      this.btnCopyError.textContent = state.errorCopied ? "✅ Copied!" : "📋 Copy Report";
    }
  }

  /**
   * Sets manual textarea content and opens collapsible details.
   * @param {string} text
   */
  setManualText(text) {
    if (this.manualTextarea) {
      this.manualTextarea.value = text;
    }
    if (this.manualDetails) {
      this.manualDetails.open = true;
    }
  }

  /**
   * Binds user event listeners to DOM elements.
   *
   * @param {Object} handlers
   * @param {(file: File) => void} handlers.onFileSelected
   * @param {(text: string) => void} handlers.onTextInput
   * @param {() => void} handlers.onLoadSample
   * @param {() => void} [handlers.onClear]
   * @param {() => void} handlers.onSolve
   * @param {() => void} handlers.onStop
   * @param {() => void} handlers.onCopy
   * @param {() => void} [handlers.onCopyError]
   * @param {() => void} [handlers.onDownloadError]
   */
  bindEvents({
    onFileSelected,
    onTextInput,
    onLoadSample,
    onClear,
    onSolve,
    onStop,
    onCopy,
    onCopyError,
    onDownloadError,
  }) {
    // Drop zone click and key navigation
    this.dropZone.addEventListener("click", () => this.fileInput.click());
    this.dropZone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.fileInput.click();
      }
    });

    // Native file input
    this.fileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    });

    // Drag and drop states
    ["dragenter", "dragover"].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        this.dropZone.classList.add("drag-active");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        this.dropZone.classList.remove("drag-active");
      });
    });

    this.dropZone.addEventListener("drop", (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) onFileSelected(file);
    });

    // Manual textarea input with light debounce
    let debounceTimer = null;
    this.manualTextarea.addEventListener("input", () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onTextInput(this.manualTextarea.value);
      }, 150);
    });

    // Action buttons
    this.btnLoadSample.addEventListener("click", onLoadSample);
    if (this.btnClear && onClear) {
      this.btnClear.addEventListener("click", onClear);
    }
    this.btnSolve.addEventListener("click", onSolve);
    this.btnStop.addEventListener("click", onStop);
    this.btnCopy.addEventListener("click", () => onCopy());

    if (this.btnCopyError && onCopyError) {
      this.btnCopyError.addEventListener("click", onCopyError);
    }
    if (this.btnDownloadError && onDownloadError) {
      this.btnDownloadError.addEventListener("click", onDownloadError);
    }
  }
}
