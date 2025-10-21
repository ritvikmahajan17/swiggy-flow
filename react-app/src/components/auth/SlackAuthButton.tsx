import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useOAuthFlow } from "@/hooks/useOAuthFlow";

export function SlackAuthButton() {
  const { slackConnected, discordConnected } = useAuthStore();
  const { handleSlackAuth } = useOAuthFlow();

  const getStatusLabel = () => {
    if (slackConnected) return { text: "✓ Connected", color: "text-green-600" };
    if (discordConnected) return { text: "Discord chosen", color: "text-gray-400" };
    return { text: "Choose one", color: "text-[#ff8c3a]" };
  };

  const status = getStatusLabel();

  return (
    <Button
      onClick={handleSlackAuth}
      disabled={slackConnected || discordConnected}
      className="w-full flex items-center justify-between h-auto py-3.5 px-4 border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-[#36c5f0] disabled:opacity-50 disabled:bg-gray-100 font-semibold text-[15px]"
      variant="outline"
    >
      <div className="flex items-center gap-3">
        <svg width="20" height="20" viewBox="0 0 54 54">
          <g>
            <path
              fill="#E01E5A"
              d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386"
            />
            <path
              fill="#36C5F0"
              d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387"
            />
            <path
              fill="#2EB67D"
              d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386"
            />
            <path
              fill="#ECB22E"
              d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336-.001v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387"
            />
          </g>
        </svg>
        <span>Slack</span>
      </div>
      <span className={`text-xs font-semibold ${status.color}`}>
        {status.text}
      </span>
    </Button>
  );
}
