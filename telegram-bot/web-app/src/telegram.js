// web-app/src/telegram.js

export function getTelegramUser() {
  if (window.Telegram.WebApp) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
}
