/**
 * Application Entry Point (Early Boot & Error Boundary).
 */
import './styles/main.css';
import { errorLogger } from './services/errorLogger.js';
import { errorBoundaryView } from './views/errorBoundaryView.js';

// 1. Trap and isolate any catastrophic unhandled errors on line 1
errorLogger.initGlobalHandlers((entry) => {
  errorBoundaryView.showFatalCrash(entry);
});

// 2. Boot Application Controller (MVC)
try {
  const { AppController } = await import('./controllers/appController.js');
  const controller = new AppController();
  controller.init();
} catch (err) {
  const entry = errorLogger.recordError(err, { phase: 'bootstrap' });
  errorBoundaryView.showFatalCrash(entry);
}

