// telegram-bot/bot.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Telegram Web App URL (host your frontend here)
const WEB_APP_URL = 'https://yourdomain.com'; // <-- Replace with your actual domain

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;

  const webAppButton = {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '▶️ Play Mythic Warriors',
          web_app: { url: `${WEB_APP_URL}/?tgid=${msg.from.id}` }
        }
      ]]
    }
  };

  bot.sendMessage(chatId, `Welcome ${firstName}!\nClick below to launch Mythic Warriors!`, webAppButton);
});

console.log('Telegram bot is running...');
