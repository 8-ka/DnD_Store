import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";
dotenv.config();
var token = process.env.TELEGRAM_BOT_TOKEN || "";
var bot = new TelegramBot(token, { polling: true });
var WEB_APP_URL = "https://dnd-store.vercel.app/"; // Замени на свой Vercel-адрес
// 🔹 Обрабатываем команду /wannabuy
bot.onText(/\/wannabuy/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, "🛍 За покупочками: [Din Din Store](https://t.me/din_din_store_bot/dds)", {
      parse_mode: "Markdown"
    });
  });

  console.log("Работает!..");
  
