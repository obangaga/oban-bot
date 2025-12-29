require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { checkCookinTokens } = require('./check-cookin');

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
