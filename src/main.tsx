import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initTheme } from './store/themeStore';
import PwaProvider from './components/PwaProvider';
import App from './App.tsx';

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaProvider>
      <App />
    </PwaProvider>
  </StrictMode>,
);
