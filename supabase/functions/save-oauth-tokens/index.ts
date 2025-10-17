import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, provider, accessToken, refreshToken } = await req.json();

    // Validate input
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

    // Prepare update object based on provider
    const updateData: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };

    if (provider === "google") {
      updateData.gmail_access_token = accessToken || null;
      updateData.gmail_refresh_token = refreshToken || null;
      updateData.gmail_access_token_expires_at = accessToken
        ? new Date(Date.now() + 3600 * 1000).toISOString()
        : null;
    } else if (provider === "slack") {
      updateData.slack_token = accessToken || null;
    }

    // Update public.users table
    const { error, data } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to save tokens",
          details: error.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!data || data.length === 0) {
      console.error("User not found:", userId);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
