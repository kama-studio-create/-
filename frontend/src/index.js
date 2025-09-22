import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Telegram WebApp Initialization
const initializeTelegramWebApp = () => {
  if (window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    
    try {
      webApp.ready();
      webApp.expand();
      webApp.setHeaderColor('#1a1b3e');
      webApp.setBackgroundColor('#0f0f23');
      webApp.enableClosingConfirmation();
      
      console.log('🔗 Telegram WebApp initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram WebApp:', error);
      return false;
    }
  }
  
  console.log('ℹ️ Running outside Telegram WebApp');
  return false;
};

// Error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Render app
const render = () => {
  const isTelegramApp = initializeTelegramWebApp();
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App isTelegramApp={isTelegramApp} />
    </React.StrictMode>
  );
};

render();