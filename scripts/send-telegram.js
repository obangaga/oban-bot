const axios = require('axios');
const fs = require('fs');

async function sendToTelegram() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    // Baca data token dari file
    const tokensData = fs.readFileSync('tokens.json', 'utf8');
    const tokens = JSON.parse(tokensData);
    
    if (!tokens.length) {
      console.log('No tokens to send');
      return;
    }
    
    // Kirim setiap token sebagai pesan terpisah
    for (const token of tokens) {
      const message = `
🚀 <b>NEW TOKEN ALERT</b> 🆕

🪙 <b>${token.name}</b>
💰 <b>Volume:</b> ${token.volume}
📝 <b>Description:</b> ${token.description.substring(0, 100)}...

🔗 <b>Contract:</b> <code>${token.contractAddress}</code>
🌐 <b>Links:</b> ${token.socialLinks}

⏰ <i>Detected: ${new Date().toLocaleTimeString()}</i>
      `.trim();
      
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      
      console.log(`Sent token: ${token.name}`);
      
      // Tunggu 1 detik antar pesan
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ Sent ${tokens.length} tokens to Telegram`);
  } catch (error) {
    console.error('❌ Error sending to Telegram:', error.message);
  }
}

// Jalankan
if (require.main === module) {
  sendToTelegram();
}

module.exports = { sendToTelegram };
