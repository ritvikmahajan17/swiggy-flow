import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { EDGE_FUNCTIONS } from "@/lib/constants";
import type { DiscordServer, DiscordChannel } from "@/types/auth.types";

export function useDiscordChannels() {
  const [servers, setServers] = useState<DiscordServer[]>([]);
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [botPresent, setBotPresent] = useState<boolean | null>(null);
  const [checkingBot, setCheckingBot] = useState(false);
  const { discordConnected, setChannelSelected } = useAuthStore();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once when discord is connected
    // OAuth token will be fetched from Supabase session in the edge function
    if (discordConnected && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchServers();
    }
  }, [discordConnected]);

  // Fetch channels when a server is selected
  useEffect(() => {
    if (selectedServerId) {
      fetchChannels(selectedServerId);
    } else {
      setChannels([]);
      setSelectedChannelId("");
    }
  }, [selectedServerId]);

  async function fetchServers() {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found when fetching Discord servers");
        return;
      }

      const response = await fetch(EDGE_FUNCTIONS.GET_DISCORD_SERVERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.servers) {
        setServers(data.servers);
      } else if (data.error) {
        console.error("Discord servers error:", data.error);
      }
    } catch (error) {
      console.error("Error fetching Discord servers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchChannels(guildId: string) {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(EDGE_FUNCTIONS.GET_DISCORD_CHANNELS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          guildId,
        }),
      });

      const data = await response.json();

      if (data.channels) {
        // Filter for text channels only (type 0 = text channel)
        const textChannels = data.channels.filter(
          (ch: DiscordChannel) => ch.type === 0
        );
        setChannels(textChannels);
      }
    } catch (error) {
      console.error("Error fetching Discord channels:", error);
    } finally {
      setLoading(false);
    }
  }

  async function checkBotPresence(guildId: string) {
    setCheckingBot(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setBotPresent(false);
        return false;
      }

      const response = await fetch(EDGE_FUNCTIONS.CHECK_BOT_IN_SERVER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          guildId,
        }),
      });

      const data = await response.json();

      setBotPresent(data.botPresent || false);
      return data.botPresent || false;
    } catch (error) {
      console.error("Error checking bot presence:", error);
      setBotPresent(false);
      return false;
    } finally {
      setCheckingBot(false);
    }
  }

  async function saveSelectedChannel(userId: string) {
    if (!selectedChannelId || !selectedServerId) return false;

    // First check if bot is in the server
    const isBotPresent = await checkBotPresence(selectedServerId);

    if (!isBotPresent) {
      // Don't save the channel yet, show invite modal instead
      return false;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found");
        return false;
      }

      const requestBody = {
        userId,
        discordChannelId: selectedChannelId,
      };

      const response = await fetch(EDGE_FUNCTIONS.SAVE_DISCORD_CHANNEL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok) {
        setChannelSelected(true);
        return true;
      }

      console.error("Failed to save channel:", responseData);
      return false;
    } catch (error) {
      console.error("Error saving Discord channel:", error);
      return false;
    }
  }

  async function recheckBotAndSave(userId: string) {
    // Recheck bot presence and save if bot is now present
    if (!selectedChannelId || !selectedServerId) return false;

    const isBotPresent = await checkBotPresence(selectedServerId);

    if (!isBotPresent) {
      return false;
    }

    // Bot is present, now save the channel
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found in recheckBotAndSave");
        return false;
      }

      const requestBody = {
        userId,
        discordChannelId: selectedChannelId,
      };

      const response = await fetch(EDGE_FUNCTIONS.SAVE_DISCORD_CHANNEL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok) {
        setChannelSelected(true);
        setBotPresent(true);
        return true;
      }

      console.error("Failed to save channel in recheck:", responseData);
      return false;
    } catch (error) {
      console.error("Error saving Discord channel:", error);
      return false;
    }
  }

  return {
    servers,
    channels,
    loading,
    selectedServerId,
    setSelectedServerId,
    selectedChannelId,
    setSelectedChannelId,
    saveSelectedChannel,
    botPresent,
    checkingBot,
    recheckBotAndSave,
  };
}
