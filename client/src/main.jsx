import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // Removing React.StrictMode in WebRTC apps can be helpful during dev to prevent double firing of useEffect, 
  // but it's okay to keep it if we manage our effects correctly. We'll leave it off for simplicity.
  <App />
);
