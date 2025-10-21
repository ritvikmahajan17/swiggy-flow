import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { EDGE_FUNCTIONS } from "@/lib/constants";
import type { SlackChannel } from "@/types/auth.types";

export function useSlackChannels() {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const { slackToken, slackConnected, setChannelSelected } = useAuthStore();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once when slack is connected and we have a token
    if (slackConnected && slackToken && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchChannels(slackToken);
    }
  }, [slackConnected, slackToken]);

  async function fetchChannels(token: string) {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(EDGE_FUNCTIONS.GET_SLACK_CHANNELS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          slackToken: token,
        }),
      });

      const data = await response.json();

      if (data.channels) {
        setChannels(data.channels);
      }
    } catch (error) {
      console.error("Error fetching Slack channels:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSelectedChannel(userId: string) {
    if (!selectedChannelId) return false;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return false;

      const response = await fetch(EDGE_FUNCTIONS.SAVE_SLACK_CHANNEL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          slackChannelId: selectedChannelId,
        }),
      });

      if (response.ok) {
        setChannelSelected(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error saving channel:", error);
      return false;
    }
  }

  return {
    channels,
    loading,
    selectedChannelId,
    setSelectedChannelId,
    saveSelectedChannel,
  };
}
