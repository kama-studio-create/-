import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Constants
const THEME = {
  HEADER: '#1a1b3a',
  BACKGROUND: '#0f0f23',
  TEXT: '#ffffff'
};

// Initialize Telegram Web App
const initTelegramWebApp = () => {
  if (!window.Telegram?.WebApp) {
    console.warn('Telegram WebApp is not available');
    return false;
  }

  try {
    const webApp = window.Telegram.WebApp;
    
    // Initialize WebApp
    webApp.ready();
    webApp.expand();

    // Set theme colors
    webApp.setHeaderColor(THEME.HEADER);
    webApp.setBackgroundColor(THEME.BACKGROUND);

    // Setup main button if needed
    webApp.MainButton.setParams({
      text: 'START GAME',
      color: THEME.HEADER,
      text_color: THEME.TEXT
    });

    // Handle closing
    webApp.onEvent('viewportChanged', () => {
      // Handle viewport changes
      console.log('Viewport changed:', webApp.viewportHeight, webApp.viewportWidth);
    });

    return true;
  } catch (error) {
    console.error('Failed to initialize Telegram WebApp:', error);
    return false;
  }
};

// Initialize app with error boundary
const renderApp = () => {
  try {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App 
          isTelegramWebApp={initTelegramWebApp()}
          theme={THEME}
        />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    // Show fallback UI
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        color: ${THEME.TEXT};
        background: ${THEME.BACKGROUND};
        text-align: center;
        padding: 20px;
      ">
        <h1>Something went wrong. Please try again later.</h1>
      </div>
    `;
  }
};

// Start the app
renderApp();

// Hot module replacement support
if (import.meta.hot) {
  import.meta.hot.accept();
}

function App({ isTelegramWebApp, theme }) {
  return (
    <div style={{ background: theme.BACKGROUND, color: theme.TEXT }}>
      {isTelegramWebApp ? (
        <GameInterface />
      ) : (
        <BrowserFallback />
      )}
    </div>
  );
}