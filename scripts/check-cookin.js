// scripts/check-cookin.js
import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";

export async function checkCookinTokens() {
  try {
    console.log("🔍 Checking Cookin.fun for new tokens...");

    const url = "https://cookin.fun/";
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });

    const $ = cheerio.load(data);
    const newTokens = [];

    $("div").each((i, elem) => {
      const text = $(elem).text();
      if (text.includes("New tokens") || text.includes("🆕 New")) {
        $(elem)
          .find("div[data-mint]")
          .each((j, tokenElem) => {
            const $token = $(tokenElem);
            const name = $token.find("strong").first().text().trim();
            if (!name) return;

            const contractAddress =
              $token.attr("data-mint") ||
              $token
                .find('span[phx-hook="CopyToClipboard"]')
                .attr("data-clipboard-text");

            const imageUrl = $token.find("img").attr("src");
            const desc = $token
              .find("div")
              .filter((k, d) => {
                const t = $(d).text().trim();
                return t.length > 20 && t.length < 200;
              })
              .first()
              .text()
              .trim();

            const socialLinks = [];
            $token.find('a[target="_blank"]').each((l, linkElem) => {
              const href = $(linkElem).attr("href");
              if (
                href &&
                (href.includes("x.com") ||
                  href.includes("t.me") ||
                  href.includes("http://") ||
                  href.includes("https://"))
              ) {
                socialLinks.push(href);
              }
            });

            const volumeMatch = $token.text().match(/\$(\d+(\.\d+)?[KMB]?)/);

            newTokens.push({
              name,
              contractAddress: contractAddress || "N/A",
              imageUrl: imageUrl || "https://via.placeholder.com/100",
              description: desc || "No description",
              socialLinks:
                socialLinks.length > 0 ? socialLinks.join(", ") : "No social links",
              volume: volumeMatch ? volumeMatch[0] : "N/A",
              timestamp: new Date().toISOString(),
            });
          });
      }
    });

    console.log(`✅ Found ${newTokens.length} tokens from Cookin.fun`);

    let oldTokens = [];
    if (fs.existsSync("tokens.json")) {
      oldTokens = JSON.parse(fs.readFileSync("tokens.json", "utf8"));
    }

    const newUniqueTokens = newTokens.filter(
      (t) =>
        !oldTokens.some(
          (o) =>
            o.contractAddress === t.contractAddress || o.name === t.name
        )
    );

    if (newUniqueTokens.length > 0) {
      const updatedList = [...oldTokens, ...newUniqueTokens];
      fs.writeFileSync("tokens.json", JSON.stringify(updatedList, null, 2));
      console.log(`🆕 ${newUniqueTokens.length} truly new tokens found.`);
    } else {
      console.log("ℹ️ No new unique tokens.");
    }

    return newUniqueTokens;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return [];
  }
}
