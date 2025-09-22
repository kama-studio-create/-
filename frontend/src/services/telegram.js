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
 */
export function isTelegramWebApp() {
  return !!(window.Telegram?.WebApp);
}

/**
 * Initialize Telegram Web App
 */
export function initTelegramWebApp() {
  try {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      webApp.ready();
      webApp.expand();
      webApp.setHeaderColor('#1a1b3e');
      webApp.setBackgroundColor('#0f0f23');
      webApp.enableClosingConfirmation();

      return webApp;
    }
    return null;
  } catch (error) {
    console.error('Error initializing Telegram WebApp:', error);
    return null;
  }
}

/**
 * Get formatted user object for backend
 */
export function getFormattedTelegramUser() {
  try {
    const user = getTelegramUser();
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username || null,
      first_name: user.first_name || null,
      last_name: user.last_name || null,
      photo_url: user.photo_url || null,
      language_code: user.language_code || 'en',
      is_premium: user.is_premium || false
    };
  } catch (error) {
    console.error('Error formatting Telegram user:', error);
    return null;
  }
}

/**
 * Show Telegram main button
 */
export function showMainButton(text, onClick, options = {}) {
  try {
    if (window.Telegram?.WebApp?.MainButton) {
      const mainButton = window.Telegram.WebApp.MainButton;
      
      mainButton.setText(text);
      if (options.color) mainButton.setParams({ color: options.color });
      mainButton.show();
      
      mainButton.offClick(mainButton.onClick);
      mainButton.onClick(onClick);
      
      return mainButton;
    }
  } catch (error) {
    console.error('Error showing main button:', error);
  }
  return null;
}

/**
 * Hide Telegram main button
 */
export function hideMainButton() {
  try {
    if (window.Telegram?.WebApp?.MainButton) {
      window.Telegram.WebApp.MainButton.hide();
    }
  } catch (error) {
    console.error('Error hiding main button:', error);
  }
}

/**
 * Show haptic feedback
 */
export function hapticFeedback(type = 'impact', style = 'medium') {
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      const haptic = window.Telegram.WebApp.HapticFeedback;
      
      switch (type) {
        case 'impact':
          haptic.impactOccurred(style);
          break;
        case 'notification':
          haptic.notificationOccurred(style);
          break;
        case 'selection':
          haptic.selectionChanged();
          break;
      }
    }
  } catch (error) {
    console.error('Error with haptic feedback:', error);
  }
}