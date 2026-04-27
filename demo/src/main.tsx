import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// globals.css imports @medalsocial/meda/styles.css — no double-import needed here
import './styles/globals.css';
import './landing.css';
import { App } from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
