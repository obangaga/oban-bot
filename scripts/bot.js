require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { checkCookinTokens } = require('./check-cookin');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

(async () => {
  const tokens = await checkCookinTokens();

  if (tokens.length === 0) {
    await bot.sendMessage(CHAT_ID, "ℹ️ Tidak ada token baru di Cookin.fun saat ini.");
    console.log("📭 No new tokens found.");
    return;
  }

  let message = "🔥 *Token Baru dari Cookin.fun*\n\n";
  tokens.slice(0, 5).forEach((t, i) => {
    message += `*${i + 1}. ${t.name}*\n`;
    message += `🧾 Contract: \`${t.contractAddress}\`\n`;
    message += `💰 Volume: ${t.volume}\n`;
    message += `🔗 ${t.socialLinks}\n\n`;
  });

  await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
  console.log("✅ Pesan dikirim ke Telegram!");
})();
