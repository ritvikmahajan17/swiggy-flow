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
      // Handle SIGNED_OUT event first - clear everything immediately
      if (_event === "SIGNED_OUT") {
        setUser(null);
        clearAuth();
        return;
      }

      setUser(session?.user ?? null);

      if (session?.user) {
        // Check if this is a different user than the one in localStorage
        const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);

        if (storedUserId && storedUserId !== session.user.id) {
          // Different user - clear all stale data first
          clearAuth();
        }

        // Always set the current user ID and sync
        setUserId(session.user.id);

        // Sync with database on auth state changes
        // This ensures we get fresh data after OAuth callbacks complete
        // Add a delay for USER_UPDATED to allow OAuth edge functions to complete
        if (_event === "USER_UPDATED" || _event === "SIGNED_IN") {
          if (_event === "USER_UPDATED") {
            // Wait for OAuth edge function to finish writing to database
            await new Promise((resolve) => setTimeout(resolve, 1000));
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
      // Check if we're in an OAuth callback flow
      const url = new URL(window.location.href);
      const isOAuthCallback =
        url.searchParams.has("code") || url.hash.includes("access_token");

      // IMPORTANT: Get session first to check if we have a valid session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If no session, clear everything
      if (!session) {
        setUser(null);
        clearAuth();
        return;
      }

      const user = session.user;

      setUser(user);

      if (user) {
        // ALWAYS check if this is a different user than the one in localStorage
        const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);

        // CRITICAL: During OAuth callbacks, DON'T clear localStorage
        // The OAuth flow (useOAuthFlow) is handling the identity linking
        // and will sync the data properly
        if (storedUserId !== user.id && !isOAuthCallback) {
          // Different user (or no stored user) - clear all stale data first
          clearAuth();
        }

        // Set the current user ID
        setUserId(user.id);

        // Sync with database - this will set the correct connection states for this user
        // But skip during OAuth callback - let the OAuth flow handle it with proper timing
        if (!isOAuthCallback) {
          await syncWithDatabase(user.id);
        }
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

      const { data: userData, error } = await supabase
        .from("users")
        .select(
          "id, gmail_access_token, slack_token, discord_connected, slack_channel_id, discord_channel_id, selected_platform"
        )
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // For first time login, the OAuth callback (useOAuthFlow) will handle setting connection states
          // We should wait and let it complete, then this will be called again
          return;
        }
        console.error("Database error:", error);
        return;
      }

      if (userData) {
        // Verify the userId matches to prevent data leakage
        if (userData.id !== userId) {
          console.error(
            "User ID mismatch! Expected:",
            userId,
            "Got:",
            userData.id
          );
          return;
        }

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
    // Sign out from Supabase FIRST (this triggers SIGNED_OUT event which clears state)
    await supabase.auth.signOut();

    // Then clear local state as backup
    clearAuth();
    setUser(null);
  }

  return {
    user,
    loading,
    logout,
  };
}
