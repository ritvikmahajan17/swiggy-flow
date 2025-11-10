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
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
        // Check if this is a different user than the one in localStorage
        const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (storedUserId && storedUserId !== user.id) {
          // Different user - clear all stale data first
          console.log("Different user detected, clearing stale data");
          clearAuth();
        }

        setUserId(user.id);
        await syncWithDatabase(user.id);
      } else {
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
          "gmail_access_token, slack_token, discord_connected, slack_channel_id, discord_channel_id, selected_platform"
        )
        .eq("id", userId)
        .single();

      console.log("Database response for user sync:", { userData, error });

      if (error) {
        if (error.code === "PGRST116") {
          console.log("User not found in database - first time login");
          return;
        }
        console.error("Database error:", error);
        return;
      }

      if (userData) {
        console.log("User data from database:", {
          hasGmail: !!userData.gmail_access_token,
          hasSlack: !!userData.slack_token,
          hasDiscord: !!userData.discord_connected,
          selectedPlatform: userData.selected_platform,
        });

        const {
          setGoogleConnected,
          setSlackConnected,
          setDiscordConnected,
          setChannelSelected,
          setSelectedPlatform,
        } = useAuthStore.getState();

        setGoogleConnected(!!userData.gmail_access_token);
        setSlackConnected(
          !!userData.slack_token,
          userData.slack_token || undefined
        );
        setDiscordConnected(!!userData.discord_connected);

        console.log(
          "Discord connected state set to:",
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
