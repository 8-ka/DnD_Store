import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";


dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(token, { polling: true });

const WEB_APP_URL = "https://dnd-store.vercel.app/"; // Замени на свой Vercel-адрес

// 🔹 Обрабатываем команду /wannabuy
bot.onText(/\/wannabuy/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, "🛍 За покупочками: [Din Din Store](https://t.me/din_din_store_bot/dds)", {
      parse_mode: "Markdown"
    });
  });
