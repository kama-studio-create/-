// web-app/src/telegram.js

/**
 * Get the current Telegram user data
 * @returns {Object|null} User object or null if not available
 */
export function getTelegramUser() {
  try {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    return null;
  } catch (error) {
    console.error('Error getting Telegram user:', error);
    return null;
  }
}

/**
 * Check if the app is running in Telegram
 * @returns {boolean}
 */
export function isTelegramWebApp() {
  return !!(window.Telegram?.WebApp);
}

/**
 * Initialize Telegram Web App
 * @returns {Object|null} WebApp instance or null
 */
export function initTelegramWebApp() {
  try {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Enable closing confirmation
      webApp.enableClosingConfirmation();
      
      // Expand the Web App to full height
      webApp.expand();
      
      // Set header color to match your app theme
      webApp.setHeaderColor('#1a1b3e'); // Dark purple to match your gradient
      
      return webApp;
    }
    return null;
  } catch (error) {
    console.error('Error initializing Telegram WebApp:', error);
    return null;
  }
}

/**
 * Get Telegram Web App theme parameters
 * @returns {Object} Theme parameters
 */
export function getTelegramTheme() {
  try {
    if (window.Telegram?.WebApp?.themeParams) {
      return window.Telegram.WebApp.themeParams;
    }
    // Return default dark theme if not available
    return {
      bg_color: '#1a1b3e',
      text_color: '#ffffff',
      hint_color: '#aaaaaa',
      link_color: '#5865f2',
      button_color: '#5865f2',
      button_text_color: '#ffffff'
    };
  } catch (error) {
    console.error('Error getting Telegram theme:', error);
    return {};
  }
}

/**
 * Show Telegram main button
 * @param {string} text - Button text
 * @param {function} onClick - Click handler
 * @param {Object} options - Additional options
 */
export function showTelegramMainButton(text, onClick, options = {}) {
  try {
    if (window.Telegram?.WebApp?.MainButton) {
      const mainButton = window.Telegram.WebApp.MainButton;
      
      mainButton.setText(text);
      mainButton.show();
      
      if (options.color) {
        mainButton.setParams({ color: options.color });
      }
      
      // Remove any existing listeners
      mainButton.offClick(mainButton.onClick);
      
      // Add new click listener
      mainButton.onClick(onClick);
      
      return mainButton;
    }
  } catch (error) {
    console.error('Error showing Telegram main button:', error);
  }
  return null;
}

/**
 * Hide Telegram main button
 */
export function hideTelegramMainButton() {
  try {
    if (window.Telegram?.WebApp?.MainButton) {
      window.Telegram.WebApp.MainButton.hide();
    }
  } catch (error) {
    console.error('Error hiding Telegram main button:', error);
  }
}

/**
 * Show Telegram back button
 * @param {function} onClick - Click handler
 */
export function showTelegramBackButton(onClick) {
  try {
    if (window.Telegram?.WebApp?.BackButton) {
      const backButton = window.Telegram.WebApp.BackButton;
      backButton.show();
      
      // Remove any existing listeners
      backButton.offClick(backButton.onClick);
      
      // Add new click listener
      backButton.onClick(onClick);
      
      return backButton;
    }
  } catch (error) {
    console.error('Error showing Telegram back button:', error);
  }
  return null;
}

/**
 * Hide Telegram back button
 */
export function hideTelegramBackButton() {
  try {
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.hide();
    }
  } catch (error) {
    console.error('Error hiding Telegram back button:', error);
  }
}

/**
 * Show Telegram popup
 * @param {string} title - Popup title
 * @param {string} message - Popup message  
 * @param {Array} buttons - Array of button objects
 * @param {function} callback - Callback function
 */
export function showTelegramPopup(title, message, buttons = [], callback) {
  try {
    if (window.Telegram?.WebApp?.showPopup) {
      window.Telegram.WebApp.showPopup({
        title,
        message,
        buttons
      }, callback);
    } else {
      // Fallback to regular alert
      alert(`${title}\n\n${message}`);
      if (callback) callback();
    }
  } catch (error) {
    console.error('Error showing Telegram popup:', error);
    alert(`${title}\n\n${message}`);
    if (callback) callback();
  }
}

/**
 * Show Telegram alert
 * @param {string} message - Alert message
 * @param {function} callback - Callback function
 */
export function showTelegramAlert(message, callback) {
  try {
    if (window.Telegram?.WebApp?.showAlert) {
      window.Telegram.WebApp.showAlert(message, callback);
    } else {
      alert(message);
      if (callback) callback();
    }
  } catch (error) {
    console.error('Error showing Telegram alert:', error);
    alert(message);
    if (callback) callback();
  }
}

/**
 * Show Telegram confirm dialog
 * @param {string} message - Confirm message
 * @param {function} callback - Callback function with result
 */
export function showTelegramConfirm(message, callback) {
  try {
    if (window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      if (callback) callback(result);
    }
  } catch (error) {
    console.error('Error showing Telegram confirm:', error);
    const result = confirm(message);
    if (callback) callback(result);
  }
}

/**
 * Send data to Telegram bot
 * @param {string|Object} data - Data to send
 */
export function sendDataToTelegram(data) {
  try {
    if (window.Telegram?.WebApp?.sendData) {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      window.Telegram.WebApp.sendData(dataString);
    } else {
      console.warn('Telegram WebApp sendData not available');
    }
  } catch (error) {
    console.error('Error sending data to Telegram:', error);
  }
}

/**
 * Close Telegram Web App
 */
export function closeTelegramWebApp() {
  try {
    if (window.Telegram?.WebApp?.close) {
      window.Telegram.WebApp.close();
    }
  } catch (error) {
    console.error('Error closing Telegram WebApp:', error);
  }
}

/**
 * Get Telegram Web App version
 * @returns {string} Version string
 */
export function getTelegramWebAppVersion() {
  try {
    return window.Telegram?.WebApp?.version || 'unknown';
  } catch (error) {
    console.error('Error getting Telegram WebApp version:', error);
    return 'unknown';
  }
}

/**
 * Check if specific Telegram Web App feature is available
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export function isTelegramFeatureAvailable(feature) {
  try {
    switch (feature) {
      case 'mainButton':
        return !!(window.Telegram?.WebApp?.MainButton);
      case 'backButton':
        return !!(window.Telegram?.WebApp?.BackButton);
      case 'popup':
        return !!(window.Telegram?.WebApp?.showPopup);
      case 'confirm':
        return !!(window.Telegram?.WebApp?.showConfirm);
      case 'alert':
        return !!(window.Telegram?.WebApp?.showAlert);
      case 'sendData':
        return !!(window.Telegram?.WebApp?.sendData);
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking Telegram feature availability:', error);
    return false;
  }
}

/**
 * Create formatted user object for your backend
 * @returns {Object|null} Formatted user object
 */
export function getFormattedTelegramUser() {
  try {
    const user = getTelegramUser();
    if (!user) return null;
    
    return {
      telegramId: user.id.toString(),
      username: user.username || null,
      firstName: user.first_name || null,
      lastName: user.last_name || null,
      avatar: user.photo_url || null,
      languageCode: user.language_code || 'en',
      isPremium: user.is_premium || false
    };
  } catch (error) {
    console.error('Error formatting Telegram user:', error);
    return null;
  }
}