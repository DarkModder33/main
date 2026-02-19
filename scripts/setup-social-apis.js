#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const envExamplePath = path.join(root, ".env.social.example");
const envLocalPath = path.join(root, ".env.local");

const template = `# ============================================
# TradeHax Social API Integrations (Template)
# ============================================
# Copy required values to .env.local (never commit real secrets)

# Comma-separated providers to enable
# Supported: x,instagram,tiktok,youtube,facebook,linkedin,reddit,discord
TRADEHAX_SOCIAL_PROVIDERS=x,instagram,tiktok,youtube,facebook,linkedin,reddit,discord

# X / Twitter API
X_API_KEY=
X_API_KEY_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
X_BEARER_TOKEN=

# Instagram Graph API
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=

# TikTok API
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_ACCESS_TOKEN=

# YouTube Data API
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=

# Facebook Graph API
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=

# LinkedIn API
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_ORGANIZATION_ID=

# Reddit API
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USERNAME=
REDDIT_PASSWORD=
REDDIT_USER_AGENT=tradehax-bot/1.0

# Discord bot / announcements
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
DISCORD_ANNOUNCEMENTS_CHANNEL_ID=
`;

function appendMissingKeys(envFilePath, sourceTemplate) {
  const current = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, "utf8") : "";
  const existingKeys = new Set(
    current
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => line.slice(0, line.indexOf("=")).trim()),
  );

  const linesToAppend = [];
  for (const line of sourceTemplate.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const key = trimmed.slice(0, trimmed.indexOf("=")).trim();
    if (!existingKeys.has(key)) {
      linesToAppend.push(line);
    }
  }

  if (linesToAppend.length === 0) {
    return 0;
  }

  const prefix = current.endsWith("\n") || current.length === 0 ? "" : "\n";
  const block = `${prefix}\n# === Social API scaffold (added by npm run social:setup) ===\n${linesToAppend.join("\n")}\n`;
  fs.writeFileSync(envFilePath, `${current}${block}`, "utf8");
  return linesToAppend.length;
}

(function main() {
  fs.writeFileSync(envExamplePath, template, "utf8");
  const addedCount = appendMissingKeys(envLocalPath, template);

  process.stdout.write("\n✅ Wrote .env.social.example template\n");

  if (addedCount > 0) {
    process.stdout.write(`✅ Added ${addedCount} missing social API keys to .env.local as placeholders\n`);
  } else {
    process.stdout.write("ℹ️  .env.local already contains social API keys (or placeholders). No append needed.\n");
  }

  process.stdout.write("ℹ️  Next: fill values in .env.local, then run npm run social:check\n\n");
})();
