import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

async function refreshGmailToken(
  supabase: any,
  user: any,
  refreshToken: string
) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: Deno.env.get("GOOGLE_CLIENT_ID"),
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET"),
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokens = await response.json();

    if (tokens.access_token) {
      // Update only Gmail-specific fields, leaving Slack tokens untouched
      await supabase
        .from("users")
        .update({
          gmail_access_token: tokens.access_token,
          gmail_access_token_expires_at: new Date(
            Date.now() + tokens.expires_in * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return tokens.access_token;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }

  return null;
}

async function getValidGmailToken(supabase: any, user: any) {
  const now = new Date();
  const expiresAt = user.gmail_access_token_expires_at
    ? new Date(user.gmail_access_token_expires_at)
    : now;

  if (expiresAt < new Date(Date.now() + 60000)) {
    const newToken = await refreshGmailToken(
      supabase,
      user,
      user.gmail_refresh_token
    );
    return newToken;
  }

  return user.gmail_access_token;
}

async function getSwiggyEmailsFromLast5Mins(
  gmailToken: string,
  senderEmail: string
) {
  const fiveMinutesAgo = Math.floor((Date.now() - 5 * 60 * 1000) / 1000);

  const query = `from:${senderEmail} after:${fiveMinutesAgo}`;

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
      query
    )}&maxResults=10`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${gmailToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error(`Gmail query failed: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return data.messages || [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment configuration
    const environment = Deno.env.get("ENVIRONMENT") || "production"; // "test" or "production"
    const n8nWebhookUrl =
      environment === "test"
        ? Deno.env.get("N8N_TEST_WEBHOOK_URL")
        : Deno.env.get("N8N_WEBHOOK_URL");

    console.log(`Running in ${environment} mode`);
    console.log(
      `Using webhook: ${n8nWebhookUrl ? "configured" : "NOT CONFIGURED"}`
    );

    if (!n8nWebhookUrl) {
      console.error(
        `n8n webhook URL not configured for ${environment} environment`
      );
      return new Response(
        JSON.stringify({
          error: `Missing ${
            environment === "test" ? "N8N_TEST_WEBHOOK_URL" : "N8N_WEBHOOK_URL"
          } environment variable`,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .not("gmail_refresh_token", "is", null);
    // .not("slack_token", "is", null);

    if (error) {
      console.error("Error fetching users:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: "No users to process" }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const senderEmail = Deno.env.get("GMAIL_SENDER") || "swiggy@swiggy.in";
    let processed = 0;
    let triggered = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const gmailToken = await getValidGmailToken(supabase, user);

        if (!gmailToken) {
          console.log(`Skipping user ${user.id} - invalid Gmail token`);
          failed++;
          continue;
        }

        const swiggyEmails = await getSwiggyEmailsFromLast5Mins(
          gmailToken,
          senderEmail
        );

        console.log(user.firstScanDone, "user.firstScanDone");

        if (user.firstScanDone === true && swiggyEmails.length === 0) {
          console.log(`No new Swiggy emails for user ${user.id}`);
          processed++;
          continue;
        }

        // for (const email of swiggyEmails) {
        // const emailDetail = await getEmailDetails(email.id, gmailToken);

        // if (emailDetail) {
        //   console.log(
        //     `Triggering n8n for user ${user.id} - email ${email.id}`
        //   );

        console.log(
          `Triggering n8n webhook (${environment}) for user ${user.id}`
        );

        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            gmailToken: gmailToken,
            slackToken: user.slack_token,
            slackUserId: user.slack_user_id,
            environment: environment, // Pass environment to n8n workflow
            slackChannelId: user.slack_channel_id,
          }),
        });

        if (n8nResponse.ok) {
          triggered++;
          if (user.firstScanDone !== true) {
            await supabase
              .from("users")
              .update({ firstScanDone: true })
              .eq("id", user.id);
          }
          console.log(`n8n triggered successfully for user ${user.id}`);
        } else {
          console.error(`n8n request failed: ${n8nResponse.status}`);
          failed++;
        }
        // }
        // }

        processed++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Polling completed",
        processed,
        triggered,
        failed,
        total: users.length,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
