import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/amiri-quran';
import '@fontsource/scheherazade-new';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
