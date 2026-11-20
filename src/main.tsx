import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {runProductionCleanResetOnce} from './utils/productionReset.ts';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import {FirebaseProvider} from './context/FirebaseContext.tsx';

runProductionCleanResetOnce();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </ErrorBoundary>
);
