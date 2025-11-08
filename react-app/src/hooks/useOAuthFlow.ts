import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { EDGE_FUNCTIONS, REDIRECT_URL } from "@/lib/constants";
import type { Session } from "@supabase/supabase-js";

type Identity = {
  id: string;
  provider: string;
};

export function useOAuthFlow() {
  const {
    setGoogleConnected,
    setSlackConnected,
    setDiscordConnected,
    setUserId,
  } = useAuthStore();

  useEffect(() => {
    let processingCallback = false;
    // Check if we're returning from OAuth flow
    const handleInitialAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const url = new URL(window.location.href);
      const isOAuthCallback =
        url.searchParams.has("code") || url.hash.includes("access_token");

      console.log("Initial auth check:", {
        hasSession: !!session,
        isOAuthCallback,
        urlParams: url.searchParams.toString(),
        urlHash: url.hash,
      });

      if (session && isOAuthCallback) {
        console.log("Processing initial OAuth callback");
        await handleAuthCallback(session);
      }
    };

    handleInitialAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, {
        hasSession: !!session,
        processing: processingCallback,
      });

      // Handle both SIGNED_IN (new login) and USER_UPDATED (account linking)
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        // Prevent duplicate processing
        if (processingCallback) {
          console.log("Already processing callback, skipping duplicate");
          return;
        }

        console.log(`${event} event - processing auth callback`);

        // SIGNED_IN events with provider_token indicate OAuth login
        // Process these even if URL params are cleaned up
        if (session.provider_token) {
          processingCallback = true;
          console.log("Provider token found, processing OAuth callback");
          await handleAuthCallback(session);
          // Reset after a delay to allow legitimate subsequent logins
          setTimeout(() => {
            processingCallback = false;
          }, 2000);
        } else {
          console.log(
            "No provider token - skipping (likely email/password login)"
          );
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuthCallback(session: Session) {
    console.log("=== OAuth Callback Started ===");
    console.log("Session data:", {
      hasProviderToken: !!session.provider_token,
      hasRefreshToken: !!session.provider_refresh_token,
      appMetadataProvider: session.user.app_metadata?.provider,
      identities: session.user.identities?.map((id) => ({
        provider: id.provider,
        id: id.id,
        created_at: id.created_at,
      })),
    });

    const hasAccessToken = !!session.provider_token;

    if (!hasAccessToken) {
      console.error("No access token found in session");
      return;
    }

    // Find the most recently created identity - that's the one used for this login
    const identities = session.user.identities || [];
    const sortedIdentities = [...identities].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Most recent first
    });

    const mostRecentIdentity = sortedIdentities[0];
    let currentProvider: string | null = null;

    if (mostRecentIdentity) {
      const provider = mostRecentIdentity.provider;

      if (provider === "google") {
        currentProvider = "google";
      } else if (provider === "slack_oidc") {
        currentProvider = "slack";
      } else if (provider === "discord") {
        currentProvider = "discord";
      }
    }

    console.log("Most recent identity provider:", mostRecentIdentity?.provider);
    console.log("Detected provider:", currentProvider);

    if (currentProvider === "google") {
      await handleGoogleAuthCallback(session);
    } else if (currentProvider === "slack") {
      const slackIdentity = session.user.identities?.find(
        (id) => id.provider === "slack_oidc"
      );
      if (slackIdentity) {
        await handleSlackAuthCallback(session, slackIdentity);
      }
    } else if (currentProvider === "discord") {
      const discordIdentity = session.user.identities?.find(
        (id) => id.provider === "discord"
      );
      if (discordIdentity) {
        console.log("Calling handleDiscordAuthCallback");
        await handleDiscordAuthCallback(session);
      } else {
        console.error(
          "Discord provider detected but no discord identity found!"
        );
      }
    } else {
      console.error("Unknown provider or no provider detected");
    }
  }

  async function handleGoogleAuthCallback(session: Session) {
    const accessToken = session.provider_token;
    const refreshToken = session.provider_refresh_token;

    if (!accessToken) return;

    const success = await storeGoogleTokens(
      session.user.id,
      accessToken,
      refreshToken
    );

    if (success) {
      setGoogleConnected(true);
      setUserId(session.user.id);
    }
  }

  async function handleSlackAuthCallback(session: Session, identity: Identity) {
    const accessToken = session.provider_token;

    if (!accessToken) return;

    const slackUserId =
      session.user.user_metadata?.provider_id ||
      session.user.user_metadata?.sub ||
      identity.id;

    const success = await storeSlackTokens(
      session.user.id,
      accessToken,
      slackUserId
    );

    if (success) {
      setSlackConnected(true, accessToken);
      setUserId(session.user.id);
    }
  }

  async function handleDiscordAuthCallback(session: Session) {
    console.log("Discord auth callback started", {
      userId: session.user.id,
    });

    console.log("Setting Discord connection status...");

    const success = await setDiscordConnectionStatus(session.user.id);

    console.log("Discord connection status set:", success);

    if (success) {
      setDiscordConnected(true);
      setUserId(session.user.id);
      console.log("Discord connected state updated");
    }
  }

  async function storeGoogleTokens(
    userId: string,
    accessToken: string,
    refreshToken: string | null | undefined
  ) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session when storing Google tokens");
        return false;
      }

      const payload = {
        userId,
        provider: "google",
        accessToken,
        refreshToken,
      };

      console.log("=== Storing Google tokens ===");
      console.log("URL:", EDGE_FUNCTIONS.SAVE_OAUTH_TOKENS);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(EDGE_FUNCTIONS.SAVE_OAUTH_TOKENS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status, response.statusText);

      const responseData = await response.json();
      console.log("Response data:", JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        console.error("✗ Failed to store Google tokens:", responseData);
        return false;
      }

      console.log("✓ Google tokens stored successfully");
      return true;
    } catch (error) {
      console.error("✗ Error storing Google tokens:", error);
      return false;
    }
  }

  async function storeSlackTokens(
    userId: string,
    accessToken: string,
    slackUserId: string
  ) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session when storing Slack tokens");
        return false;
      }

      const payload = {
        userId,
        provider: "slack_oidc",
        slack_token: accessToken,
        slack_user_id: slackUserId,
      };

      console.log("=== Storing Slack tokens ===");
      console.log("URL:", EDGE_FUNCTIONS.SAVE_OAUTH_TOKENS);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(EDGE_FUNCTIONS.SAVE_OAUTH_TOKENS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status, response.statusText);

      const responseData = await response.json();
      console.log("Response data:", JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        console.error("✗ Failed to store Slack tokens:", responseData);
        return false;
      }

      console.log("✓ Slack tokens stored successfully");
      return true;
    } catch (error) {
      console.error("✗ Error storing Slack tokens:", error);
      return false;
    }
  }

  async function setDiscordConnectionStatus(userId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session when setting Discord connection status");
        return false;
      }

      const payload = {
        userId,
        provider: "discord",
        discord_connected: true,
      };

      console.log("=== Setting Discord connection status ===");
      console.log("URL:", EDGE_FUNCTIONS.SAVE_OAUTH_TOKENS);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(EDGE_FUNCTIONS.SAVE_OAUTH_TOKENS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status, response.statusText);

      const responseData = await response.json();
      console.log("Response data:", JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        console.error(
          "✗ Failed to set Discord connection status:",
          responseData
        );
        return false;
      }

      console.log("✓ Discord connection status set successfully");
      return true;
    } catch (error) {
      console.error("✗ Error setting Discord connection status:", error);
      return false;
    }
  }

  async function handleGoogleAuth() {
    console.log(REDIRECT_URL);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: REDIRECT_URL,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        scopes: "https://www.googleapis.com/auth/gmail.readonly",
      },
    });

    if (error) {
      console.error("Google auth error:", error);
      alert("Failed to connect Google. Please try again.");
    }
  }

  async function handleSlackAuth() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "slack_oidc",
      options: {
        redirectTo: REDIRECT_URL,
      },
    });

    if (error) {
      console.error("Slack auth error:", error);
      alert("Failed to connect Slack. Please try again.");
    }
  }

  async function handleDiscordAuth() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: REDIRECT_URL,
        scopes: "identify guilds guilds.members.read",
      },
    });

    if (error) {
      console.error("Discord auth error:", error);
      alert("Failed to connect Discord. Please try again.");
    }
  }

  return {
    handleGoogleAuth,
    handleSlackAuth,
    handleDiscordAuth,
    storeDiscordConnection: setDiscordConnectionStatus,
  };
}
