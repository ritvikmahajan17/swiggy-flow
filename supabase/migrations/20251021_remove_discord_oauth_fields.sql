-- Remove unnecessary Discord OAuth fields
-- We only need discord_channel_id since:
-- 1. Channel IDs are globally unique across Discord
-- 2. Bot token will be stored as environment variable (not per-user)
-- 3. Guild ID is not needed to send messages to a channel
-- 4. User ID from OAuth is not needed for bot operations

-- Remove discord_token column (OAuth user token, not the bot token)
ALTER TABLE users DROP COLUMN IF EXISTS discord_token;

-- Remove discord_guild_id column (not needed since channel IDs are globally unique)
ALTER TABLE users DROP COLUMN IF EXISTS discord_guild_id;

-- Remove discord_user_id column (not needed for bot operations)
ALTER TABLE users DROP COLUMN IF EXISTS discord_user_id;

-- Keep these columns:
-- - discord_connected (boolean to track if user has connected Discord)
-- - discord_channel_id (globally unique channel ID where messages will be sent)
