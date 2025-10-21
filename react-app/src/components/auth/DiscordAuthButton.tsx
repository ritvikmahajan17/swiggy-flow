import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useOAuthFlow } from "@/hooks/useOAuthFlow";

export function DiscordAuthButton() {
  const { slackConnected, discordConnected } = useAuthStore();
  const { handleDiscordAuth } = useOAuthFlow();

  const getStatusLabel = () => {
    if (discordConnected) return { text: "✓ Connected", color: "text-green-600" };
    if (slackConnected) return { text: "Slack chosen", color: "text-gray-400" };
    return { text: "Choose one", color: "text-[#ff8c3a]" };
  };

  const status = getStatusLabel();

  return (
    <Button
      onClick={handleDiscordAuth}
      disabled={slackConnected || discordConnected}
      className="w-full flex items-center justify-between h-auto py-3.5 px-4 border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-[#5865f2] disabled:opacity-50 disabled:bg-gray-100 font-semibold text-[15px]"
      variant="outline"
    >
      <div className="flex items-center gap-3">
        <svg width="20" height="20" viewBox="0 0 71 55">
          <path
            fill="#5865F2"
            d="M60.105 4.898A58.55 58.55 0 0 0 45.653.415a.22.22 0 0 0-.233.11 40.784 40.784 0 0 0-1.8 3.697c-5.456-.817-10.886-.817-16.23 0-.485-1.164-1.201-2.587-1.828-3.697a.228.228 0 0 0-.233-.11 58.386 58.386 0 0 0-14.451 4.483.207.207 0 0 0-.095.082C1.578 18.73-.944 32.144.293 45.39a.244.244 0 0 0 .093.167c6.073 4.46 11.955 7.167 17.729 8.962a.23.23 0 0 0 .249-.082 42.08 42.08 0 0 0 3.627-5.9.225.225 0 0 0-.123-.312 38.772 38.772 0 0 1-5.539-2.64.228.228 0 0 1-.022-.378c.372-.279.744-.569 1.1-.862a.22.22 0 0 1 .23-.03c11.619 5.304 24.198 5.304 35.68 0a.219.219 0 0 1 .233.027c.356.293.728.586 1.103.865a.228.228 0 0 1-.02.378 36.384 36.384 0 0 1-5.54 2.637.227.227 0 0 0-.121.315 47.249 47.249 0 0 0 3.624 5.897.225.225 0 0 0 .249.084c5.801-1.794 11.684-4.502 17.757-8.961a.228.228 0 0 0 .092-.164c1.48-15.315-2.48-28.618-10.497-40.412a.18.18 0 0 0-.093-.084Zm-36.38 32.427c-3.497 0-6.38-3.211-6.38-7.156 0-3.944 2.827-7.156 6.38-7.156 3.583 0 6.438 3.24 6.382 7.156 0 3.945-2.827 7.156-6.381 7.156Zm23.593 0c-3.498 0-6.38-3.211-6.38-7.156 0-3.944 2.826-7.156 6.38-7.156 3.582 0 6.437 3.24 6.38 7.156 0 3.945-2.798 7.156-6.38 7.156Z"
          />
        </svg>
        <span>Discord</span>
      </div>
      <span className={`text-xs font-semibold ${status.color}`}>
        {status.text}
      </span>
    </Button>
  );
}
