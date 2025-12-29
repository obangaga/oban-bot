// scripts/bot.js
import { fetch as undiciFetch } from "undici";
if (!global.fetch) global.fetch = undiciFetch;

import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { checkCookinTokens } from "./check-cookin.js";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

(async () => {
  const newTokens = await checkCookinTokens();

  if (newTokens.length === 0) {
    console.log("📭 No new tokens to send.");
    return;
  }

  let message = "🔥 *Token Baru dari Cookin.fun*\n\n";
  newTokens.slice(0, 5).forEach((t, i) => {
    message += `*${i + 1}. ${t.name}*\n`;
    message += `🧾 Contract: \`${t.contractAddress}\`\n`;
    message += `💰 Volume: ${t.volume}\n`;
    message += `🔗 ${t.socialLinks}\n\n`;
  });

  await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
  console.log("✅ New token update sent to Telegram!");
})();
