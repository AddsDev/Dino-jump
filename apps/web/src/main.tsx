import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installDevTestHook } from './test/testHook';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Dev-only test hook used by Playwright E2E specs.
// The `import.meta.env.DEV` flag is statically false in production builds,
// so this block and its imports are tree-shaken away by Vite.
installDevTestHook();
