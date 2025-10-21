import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

// Type definitions for request payload
interface OAuthTokenRequest {
  userId: string;
  provider: string;
  // Google OAuth fields
  accessToken?: string;
  refreshToken?: string;
  // Slack OAuth fields
  slack_user_id?: string;
  slack_token?: string;
  // Discord fields (bot-based, not OAuth)
  discord_connected?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: OAuthTokenRequest = await req.json();
    console.log("Received payload:", payload);
    const { userId, provider } = payload;

    // Validate required fields
    if (!userId || !provider) {
      return new Response(
        JSON.stringify({ error: "Missing userId or provider" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Saving ${provider} tokens for user ${userId}`);

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    const userExists = existingUser !== null && fetchError?.code !== "PGRST116";

    // Prepare update object - only include fields for this specific provider
    const updateData: Record<string, string | null | boolean> = {
      updated_at: new Date().toISOString(),
    };

    // Handle Google OAuth tokens
    if (provider === "google") {
      const { accessToken, refreshToken } = payload;

      if (!accessToken) {
        return new Response(
          JSON.stringify({ error: "Missing Google access token" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Storing Google OAuth tokens");
      updateData.gmail_access_token = accessToken;
      updateData.gmail_refresh_token = refreshToken || null;
      updateData.gmail_access_token_expires_at = new Date(
        Date.now() + 3600 * 1000
      ).toISOString(); // Token expires in 1 hour
    }
    // Handle Slack OAuth tokens
    else if (provider === "slack_oidc" || provider === "slack") {
      const { slack_token, slack_user_id } = payload;

      if (!slack_token) {
        return new Response(
          JSON.stringify({ error: "Missing Slack access token" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Storing Slack OAuth tokens", {
        hasUserId: !!slack_user_id,
      });

      updateData.slack_token = slack_token;
      updateData.slack_user_id = slack_user_id || null;
      updateData.selected_platform = "slack";
    }
    // Handle Discord connection (bot-based, not OAuth)
    else if (provider === "discord") {
      const { discord_connected } = payload;

      // Set discord_connected status (bot is added via invite link, not OAuth)
      console.log("Storing Discord connection status", {
        discordConnected: discord_connected,
      });

      // Set discord_connected if explicitly provided, or default to true
      updateData.discord_connected = discord_connected !== undefined ? discord_connected : true;
      updateData.selected_platform = "discord";
    }
    // Unsupported provider
    else {
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${provider}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(JSON.stringify(updateData, null, 2));

    let data, upsertError;

    // If user exists, use UPDATE to only modify specific fields
    // If user doesn't exist, use INSERT to create new user
    if (userExists) {
      const result = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId)
        .select();

      data = result.data;
      upsertError = result.error;
    } else {
      // For new users, we need to include the id
      const result = await supabase
        .from("users")
        .insert({ id: userId, ...updateData })
        .select();

      data = result.data;
      upsertError = result.error;
    }

    if (upsertError) {
      console.error("Database error:", upsertError);
      return new Response(
        JSON.stringify({
          error: "Failed to save tokens",
          details: upsertError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!data || data.length === 0) {
      console.error("Failed to upsert user:", userId);
      return new Response(
        JSON.stringify({ error: "Failed to save user data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Successfully saved ${provider} tokens for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${provider} tokens saved successfully`,
        user: data[0],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
