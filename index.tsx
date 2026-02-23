import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initStarfield } from './utils/starfield';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Initialize the starfield animation
initStarfield();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use an absolute path derived from the document's base URI to register the service worker.
    // This is more reliable than window.location.href in sandboxed or iframe-based environments
    // where window.location.href might be 'about:blank'.
    const swUrl = new URL('sw.js', document.baseURI);
    navigator.serviceWorker.register(swUrl.href).then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.error('ServiceWorker registration failed: ', err);
    });
  });
}