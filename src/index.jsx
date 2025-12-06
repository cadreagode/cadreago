import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { StatusProvider } from './lib/statusContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Temporarily remove StrictMode for Google Maps stability
root.render(
  <StatusProvider>
    <App />
  </StatusProvider>
);
