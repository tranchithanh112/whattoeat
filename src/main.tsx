import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support. Registration waits for load so it never competes with the
// first paint, and a failure is not worth surfacing to the user.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register('/sw.js')
      // Check for a newer worker on every load. Without this a long-lived
      // tab can stay on an old worker for a full day.
      .then((registration) => registration.update())
      .catch(() => {});
  });
}
