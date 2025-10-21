const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { slackToken } = await req.json();

    if (!slackToken) {
      return new Response(
        JSON.stringify({ error: "Missing Slack token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch channels from Slack API
    const response = await fetch("https://slack.com/api/conversations.list", {
      headers: {
        Authorization: `Bearer ${slackToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.ok) {
      return new Response(
        JSON.stringify({ error: data.error || "Failed to fetch channels" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Filter channels: only active channels the user is a member of
    const channels = data.channels
      .filter((channel: any) => !channel.is_archived && channel.is_member)
      .map((channel: any) => ({
        id: channel.id,
        name: channel.name,
      }));

    return new Response(
      JSON.stringify({ channels }),
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
