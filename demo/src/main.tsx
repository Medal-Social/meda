import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@medalsocial/meda/styles.css';
import { App } from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
