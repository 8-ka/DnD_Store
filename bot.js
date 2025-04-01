const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// 🔹 Укажи токен бота
const token = process.env.BOT_TOKEN || "8159734154:AAGOpe3OkB0QapMDt_Bh1CO7O1vxP2RXEno";

const bot = new TelegramBot(token, { polling: true });

// 🔹 Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // 🔹 Кнопка для запуска Web App
  const webAppButton = {
    text: '🛍 Открыть магазин',
    web_app: { url: 'https://dnd-store.vercel.app' } // Заменить на реальный URL
  };

  // 🔹 Отправка сообщения с кнопкой
  bot.sendMessage(chatId, 'Привет! Добро пожаловать в магазин Din Din!', {
    reply_markup: {
      keyboard: [[webAppButton]],
      resize_keyboard: true,
      one_time_keyboard: true // Скрывает клавиатуру после нажатия
    }
  });
});

console.log('Бот запущен...');
