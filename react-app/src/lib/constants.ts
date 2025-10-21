export const SUPABASE_URL = "https://ddmytypyxaumamqrofgz.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbXl0eXB5eGF1bWFtcXJvZmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjA0MTAsImV4cCI6MjA3NjAzNjQxMH0.xhZ7WKrxorgcC0lU25_L9_RqwpGKLY-XNLuyF3Y5ICk";

export const STORAGE_KEYS = {
  GOOGLE_CONNECTED: "swiggy_google_connected",
  SLACK_CONNECTED: "swiggy_slack_connected",
  DISCORD_CONNECTED: "swiggy_discord_connected",
  CHANNEL_SELECTED: "swiggy_channel_selected",
  SELECTED_PLATFORM: "swiggy_selected_platform",
  USER_ID: "swiggy_user_id",
  SLACK_TOKEN: "swiggy_slack_token",
} as const;

export const EDGE_FUNCTIONS = {
  SAVE_OAUTH_TOKENS: `${SUPABASE_URL}/functions/v1/save-oauth-tokens`,
  GET_SLACK_CHANNELS: `${SUPABASE_URL}/functions/v1/get-slack-channels`,
  SAVE_SLACK_CHANNEL: `${SUPABASE_URL}/functions/v1/save-slack-channel`,
  GET_DISCORD_SERVERS: `${SUPABASE_URL}/functions/v1/get-discord-servers`,
  GET_DISCORD_CHANNELS: `${SUPABASE_URL}/functions/v1/get-discord-channels`,
  SAVE_DISCORD_CHANNEL: `${SUPABASE_URL}/functions/v1/save-discord-channel`,
  CHECK_BOT_IN_SERVER: `${SUPABASE_URL}/functions/v1/check-bot-in-server`,
} as const;

export const REDIRECT_URL = `${window.location.origin}/login`;

// Discord Bot Configuration
// Bot invite URL - Make sure "Require OAuth2 Code Grant" is DISABLED in Discord Developer Portal
// Go to: Discord Dev Portal > Your App > OAuth2 > General > Uncheck "Require OAuth2 Code Grant"
// Permissions value 3072 = Send Messages (2048) + View Channels (1024)
export const DISCORD_BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=1430124044425887796&permissions=3072&scope=bot%20applications.commands";
