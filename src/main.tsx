import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {runProductionCleanResetOnce} from './utils/productionReset.ts';

runProductionCleanResetOnce();

createRoot(document.getElementById('root')!).render(<App />);
