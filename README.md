# Digital Sequence Puzzle Solver

A fast, client-side, zero-backend single-page application built with vanilla JavaScript (ES modules), HTML5, and modern CSS3, powered by **Vite** and ready for deployment on **Cloudflare Pages**.

It solves the digital sequence puzzle: given a set of numeric fragments, find the longest single-line sequence where consecutive fragments overlap by exactly their connecting 2 digits (the last 2 digits of fragment $A$ match the first 2 digits of fragment $B$).

---

## Features

- **Modern Vite Dev Environment**: Instant server startup, automatic browser opening, and Hot Module Replacement (HMR).
- **100% Client-Side & Private**: Runs entirely in the user's browser inside a dedicated Web Worker (`solver.worker.js`). Sensitive files and data never touch any server.
- **High Performance (Anytime Branch & Bound DFS)**: Non-blocking 60fps UI that streams progressive improvements in real time and can be paused, stopped, or re-solved.
- **Flexible Data Input**:
  - Drag-and-drop `.txt` file zone with loading indicators (`aria-busy`).
  - Standard file browser picker.
  - Direct multiline text paste area.
  - 1-click **"Load Sample (142 items)"** button with the problem dataset.
- **Modern UI / UX**:
  - Fixed dark theme built with modern `oklch` color spaces.
  - Fully accessible (WCAG AA compliant, `:focus-visible` outlines, accessible button dimensions $\ge 44$px).
  - One-click copy of the final concatenated number sequence to clipboard.
- **Zero-Server Error Diagnostics**: Captures unhandled exceptions and validation errors locally (`sessionStorage`), providing 1-click **"📋 Copy Error Report"** (Markdown ready for GitHub Issues) and **"💾 Download Diagnostics"** (`.json`) buttons without third-party tracking.
- **Cloudflare Pages Ready**: Includes `_headers` with strict Content Security Policy (CSP), frame protection, `Permissions-Policy`, and immutable 1-year caching for static assets.

---

## Local Development & Testing

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Dev Server (with Auto-Open & Live Reload)

```bash
npm run dev
```

This automatically starts Vite at `http://localhost:8080`, opens your default browser, and provides instant Hot Module Replacement on save.

### 3. Run Unit Tests

Uses modern native test runner (`node:test` & `node:assert/strict`):

```bash
npm test
```

### 4. Code Quality & Linting

Uses modern ESLint (Flat Config):

```bash
# Run linter:
npm run lint

# Auto-fix fixable issues:
npm run lint:fix
```

### 5. Build for Production

```bash
npm run build
```

Builds optimized, minified static assets into `dist/`.

### 6. Preview Production Build Locally

```bash
npm run preview
```

---

## Project Structure

```
├── .github/workflows/
│   └── ci.yml             # GitHub Actions CI matrix (Node 20/22) + Cloudflare deploy
├── public/                # Static assets copied directly to dist during build
│   ├── _headers           # Cloudflare Pages HTTP security headers & CSP
│   └── sample.txt         # 142 numeric fragments from the problem
├── src/
│   ├── main.js                # Early boot entry point & Error Boundary trap
│   ├── models/
│   │   ├── store.js           # Central application state store & observable machine
│   │   ├── puzzleModel.js     # Unified domain model facade
│   │   ├── validator.js       # Low-level digit sequence parsing logic
│   │   └── solver.js          # Low-level Branch-and-Bound trail search
│   ├── views/
│   │   ├── appView.js         # Pure presentation layer & DOM renderer
│   │   └── errorBoundaryView.js # Emergency fallback crash screen
│   ├── controllers/
│   │   └── appController.js   # Orchestrates state, views, and services
│   ├── services/
│   │   ├── solverService.js   # Background Web Worker manager & timer
│   │   ├── solver.worker.js   # Dedicated background Web Worker
│   │   ├── fileService.js     # FileReader & dataset fetcher
│   │   ├── clipboardService.js# Async Clipboard API wrapper with fallback
│   │   └── errorLogger.js     # Local diagnostic logger & Markdown/JSON exporter
│   └── styles/
│       ├── main.css           # CSS index combining modular stylesheets
│       ├── variables.css      # OKLCH design tokens, colors & metrics
│       ├── base.css           # Reset, layout & header/footer typography
│       ├── components.css     # Cards, drop zone, buttons, badges, outputs
│       └── utilities.css      # Screen reader & visibility utility classes
├── tests/
│   ├── store.test.js          # Unit tests for state machine & transitions
│   ├── validator.test.js      # Validation edge cases & error handling tests
│   ├── solver.test.js         # Algorithm & constraint verification tests
│   ├── errorLogger.test.js    # Diagnostic buffer & Markdown report tests
│   └── benchmark.test.js      # 142-item sample benchmark & sequence verification
├── index.html                 # Semantic accessible UI markup (Vite entrypoint)
├── package.json               # Project metadata, Vite devDependencies & npm scripts
└── vite.config.js             # Vite configuration (port 8080, auto-open, esnext)
```

---

## CI / CD & Deployment

A complete GitHub Actions workflow is provided in `.github/workflows/ci.yml`: 3. **CI**: Automatically runs tests and builds Vite across Node.js 20.x and 22.x on every push and pull request. 4. **CD**: Automatically deploys the built `dist/` directory to **Cloudflare Pages** upon merging to `main`.
