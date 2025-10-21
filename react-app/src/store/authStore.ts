import { create } from "zustand";
import type { AuthState, Platform } from "@/types/auth.types";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthStore extends AuthState {
  setGoogleConnected: (connected: boolean) => void;
  setSlackConnected: (connected: boolean, token?: string) => void;
  setDiscordConnected: (connected: boolean) => void;
  setChannelSelected: (selected: boolean) => void;
  setSelectedPlatform: (platform: Platform) => void;
  setUserId: (userId: string | null) => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
  clearAuth: () => void;
  shouldRedirectToDashboard: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  googleConnected: false,
  slackConnected: false,
  discordConnected: false,
  channelSelected: false,
  selectedPlatform: null,
  userId: null,
  slackToken: null,

  setGoogleConnected: (connected) => {
    set({ googleConnected: connected });
    get().saveToLocalStorage();
  },

  setSlackConnected: (connected, token) => {
    set({
      slackConnected: connected,
      slackToken: token || null,
      selectedPlatform: connected ? "slack" : get().selectedPlatform,
    });
    get().saveToLocalStorage();
  },

  setDiscordConnected: (connected) => {
    set({
      discordConnected: connected,
      selectedPlatform: connected ? "discord" : get().selectedPlatform,
    });
    get().saveToLocalStorage();
  },

  setChannelSelected: (selected) => {
    set({ channelSelected: selected });
    get().saveToLocalStorage();
  },

  setSelectedPlatform: (platform) => {
    set({ selectedPlatform: platform });
    get().saveToLocalStorage();
  },

  setUserId: (userId) => {
    set({ userId });
    get().saveToLocalStorage();
  },

  loadFromLocalStorage: () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) return false;

    set({
      userId,
      googleConnected:
        localStorage.getItem(STORAGE_KEYS.GOOGLE_CONNECTED) === "true",
      slackConnected:
        localStorage.getItem(STORAGE_KEYS.SLACK_CONNECTED) === "true",
      discordConnected:
        localStorage.getItem(STORAGE_KEYS.DISCORD_CONNECTED) === "true",
      channelSelected:
        localStorage.getItem(STORAGE_KEYS.CHANNEL_SELECTED) === "true",
      selectedPlatform: localStorage.getItem(
        STORAGE_KEYS.SELECTED_PLATFORM
      ) as Platform,
      slackToken: localStorage.getItem(STORAGE_KEYS.SLACK_TOKEN),
    });

    return true;
  },

  saveToLocalStorage: () => {
    const state = get();
    if (!state.userId) return;

    localStorage.setItem(STORAGE_KEYS.USER_ID, state.userId);
    localStorage.setItem(
      STORAGE_KEYS.GOOGLE_CONNECTED,
      state.googleConnected.toString()
    );
    localStorage.setItem(
      STORAGE_KEYS.SLACK_CONNECTED,
      state.slackConnected.toString()
    );
    localStorage.setItem(
      STORAGE_KEYS.DISCORD_CONNECTED,
      state.discordConnected.toString()
    );
    localStorage.setItem(
      STORAGE_KEYS.CHANNEL_SELECTED,
      state.channelSelected.toString()
    );
    if (state.selectedPlatform) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PLATFORM, state.selectedPlatform);
    }
    if (state.slackToken) {
      localStorage.setItem(STORAGE_KEYS.SLACK_TOKEN, state.slackToken);
    }
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.GOOGLE_CONNECTED);
    localStorage.removeItem(STORAGE_KEYS.SLACK_CONNECTED);
    localStorage.removeItem(STORAGE_KEYS.DISCORD_CONNECTED);
    localStorage.removeItem(STORAGE_KEYS.CHANNEL_SELECTED);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PLATFORM);
    localStorage.removeItem(STORAGE_KEYS.SLACK_TOKEN);

    set({
      googleConnected: false,
      slackConnected: false,
      discordConnected: false,
      channelSelected: false,
      selectedPlatform: null,
      userId: null,
      slackToken: null,
    });
  },

  shouldRedirectToDashboard: () => {
    const state = get();
    return state.googleConnected && (state.slackConnected || state.discordConnected);
  },
}));
