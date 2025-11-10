import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { STORAGE_KEYS } from "@/lib/constants";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUserId, clearAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state change event:", _event);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check if this is a different user than the one in localStorage
        const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (storedUserId && storedUserId !== session.user.id) {
          // Different user - clear all stale data first
          console.log("Auth state change: Different user detected, clearing stale data");
          clearAuth();
        }
        setUserId(session.user.id);

        // Sync with database on auth state changes
        // This ensures we get fresh data after OAuth callbacks complete
        // Add a delay for USER_UPDATED to allow OAuth edge functions to complete
        if (_event === "USER_UPDATED" || _event === "SIGNED_IN") {
          if (_event === "USER_UPDATED") {
            // Wait for OAuth edge function to finish writing to database
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          await syncWithDatabase(session.user.id);
        }
      } else {
        clearAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUserId, clearAuth]);

  async function checkAuth() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        // ALWAYS check if this is a different user than the one in localStorage
        const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);

        if (storedUserId !== user.id) {
          // Different user (or no stored user) - clear all stale data first
          console.log("Different user detected (stored:", storedUserId, "current:", user.id, "), clearing stale data");
          clearAuth();
        }

        // Set the current user ID
        setUserId(user.id);

        // Sync with database - this will set the correct connection states for this user
        await syncWithDatabase(user.id);
      } else {
        // No user - clear everything
        clearAuth();
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setLoading(false);
    }
  }

  async function syncWithDatabase(userId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      console.log("Syncing with database for user:", userId);

      const { data: userData, error } = await supabase
        .from("users")
        .select(
          "id, gmail_access_token, slack_token, discord_connected, slack_channel_id, discord_channel_id, selected_platform"
        )
        .eq("id", userId)
        .single();

      console.log("Database response for user sync:", { userData, error });

      if (error) {
        if (error.code === "PGRST116") {
          console.log("User not found in database - first time login, user row will be created by OAuth callback");
          // Don't clear state here - OAuth callbacks might have already set connection states
          // Just let the OAuth callbacks handle it
          return;
        }
        console.error("Database error:", error);
        return;
      }

      if (userData) {
        // Verify the userId matches to prevent data leakage
        if (userData.id !== userId) {
          console.error("User ID mismatch! Expected:", userId, "Got:", userData.id);
          return;
        }

        console.log("User data from database:", {
          hasGmail: !!userData.gmail_access_token,
          hasSlack: !!userData.slack_token,
          hasDiscord: !!userData.discord_connected,
          selectedPlatform: userData.selected_platform,
          slackChannelId: userData.slack_channel_id,
          discordChannelId: userData.discord_channel_id,
        });

        const {
          setGoogleConnected,
          setSlackConnected,
          setDiscordConnected,
          setChannelSelected,
          setSelectedPlatform,
        } = useAuthStore.getState();

        // Set connection states based on database ONLY
        // The database is the source of truth
        setGoogleConnected(!!userData.gmail_access_token);
        setSlackConnected(
          !!userData.slack_token,
          userData.slack_token || undefined
        );
        setDiscordConnected(!!userData.discord_connected);

        console.log(
          "Connection states synced from database - Google:",
          !!userData.gmail_access_token,
          "Slack:",
          !!userData.slack_token,
          "Discord:",
          !!userData.discord_connected
        );

        // User has selected a channel if they have either slack or discord channel saved
        const hasChannelSelected =
          !!userData.slack_channel_id || !!userData.discord_channel_id;
        setChannelSelected(hasChannelSelected);

        if (userData.selected_platform) {
          setSelectedPlatform(userData.selected_platform);
        }
      }
    } catch (error) {
      console.error("Error syncing with database:", error);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    clearAuth();
    setUser(null);
  }

  return {
    user,
    loading,
    logout,
  };
}
