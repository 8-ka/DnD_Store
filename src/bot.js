const TelegramBot = require('node-telegram-bot-api');
const token = HTTP_API;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const webAppButton = {
    type: 'web_app',
    text: 'Перейти в магазин',
    web_app: { url: 'https://dnd-store.vercel.app/' }, // Заменить на URL твоего Web App
  };
  
  const keyboard = {
    inline_keyboard: [[webAppButton]],
  };

  bot.sendMessage(chatId, 'Привет! Добро пожаловать в наш магазин DnD.', {
    reply_markup: keyboard,
  });
});
