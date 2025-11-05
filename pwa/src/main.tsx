import React from 'react';

import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/app.css';
import 'tippy.js/dist/tippy.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.VITE_PWA_URL}/sw.js`)
    .then((registration) => console.log('Service Worker registrado:', registration))
    .catch((err) => console.error('Erro ao registrar SW:', err));
}