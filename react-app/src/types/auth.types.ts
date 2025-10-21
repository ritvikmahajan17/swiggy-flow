export type Platform = "slack" | "discord" | null;

export type OAuthProvider = "google" | "slack_oidc" | "discord";

export interface AuthState {
  googleConnected: boolean;
  slackConnected: boolean;
  discordConnected: boolean;
  channelSelected: boolean;
  selectedPlatform: Platform;
  userId: string | null;
  slackToken: string | null;
}

export interface SlackChannel {
  id: string;
  name: string;
}

export interface DiscordServer {
  id: string;
  name: string;
  icon: string | null;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

export interface UserData {
  id: string;
  gmail_access_token: string | null;
  slack_token: string | null;
  discord_connected: boolean | null;
  slack_channel_id: string | null;
  discord_channel_id: string | null;
  selected_platform: Platform;
}
