const axios = require('axios');
const cheerio = require('cheerio');

async function checkCookinTokens() {
  try {
    console.log('🔍 Checking Cookin.fun for new tokens...');
    
    const url = 'https://cookin.fun/';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const newTokens = [];
    
    // CARI TOKEN BARU (Fokus ke bagian "New")
    // Cari section yang mengandung teks "New tokens"
    $('div').each((i, elem) => {
      const text = $(elem).text();
      if (text.includes('New tokens') || text.includes('🆕 New')) {
        // Cari token cards dalam section ini
        $(elem).find('div[data-mint]').each((j, tokenElem) => {
          const $token = $(tokenElem);
          
          // Ambil nama token
          const name = $token.find('strong').first().text().trim();
          if (!name) return;
          
          // Ambil alamat kontrak
          const contractAddress = $token.attr('data-mint') || 
                                 $token.find('span[phx-hook="CopyToClipboard"]').attr('data-clipboard-text');
          
          // Ambil gambar
          const imageUrl = $token.find('img').attr('src');
          
          // Ambil deskripsi
          const description = $token.find('div').filter((k, descElem) => {
            const descText = $(descElem).text().trim();
            return descText.length > 20 && descText.length < 200;
          }).first().text().trim();
          
          // Ambil sosial media
          const socialLinks = [];
          $token.find('a[target="_blank"]').each((l, linkElem) => {
            const href = $(linkElem).attr('href');
            if (href && (href.includes('x.com') || href.includes('t.me') || 
                href.includes('http://') || href.includes('https://'))) {
              socialLinks.push(href);
            }
          });
          
          // Ambil volume
          const volumeMatch = $token.text().match(/\$(\d+(\.\d+)?[KMB]?)/);
          
          newTokens.push({
            name,
            contractAddress: contractAddress || 'N/A',
            imageUrl: imageUrl || 'https://via.placeholder.com/100',
            description: description || 'No description',
            socialLinks: socialLinks.length > 0 ? socialLinks.join(', ') : 'No social links',
            volume: volumeMatch ? volumeMatch[0] : 'N/A',
            timestamp: new Date().toISOString()
          });
        });
      }
    });
    
    console.log(`✅ Found ${newTokens.length} new tokens`);
    
    // Format output untuk GitHub Actions
    if (newTokens.length > 0) {
      console.log('\n📋 TOKEN LIST:');
      newTokens.forEach((token, i) => {
        console.log(`\n${i+1}. ${token.name}`);
        console.log(`   Contract: ${token.contractAddress}`);
        console.log(`   Volume: ${token.volume}`);
      });
      
      // Simpan data ke file (untuk step berikutnya)
      const fs = require('fs');
      fs.writeFileSync('tokens.json', JSON.stringify(newTokens, null, 2));
      
      // Set output untuk GitHub Actions
      const summary = newTokens.map(t => t.name).join(', ');
      console.log(`::set-output name=token_count::${newTokens.length}`);
      console.log(`::set-output name=token_names::${summary}`);
      
      return newTokens;
    } else {
      console.log('ℹ️ No new tokens found');
      console.log('::set-output name=token_count::0');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('::set-output name=token_count::0');
    return [];
  }
}

// Jalankan fungsi
if (require.main === module) {
  checkCookinTokens();
}

module.exports = { checkCookinTokens };
