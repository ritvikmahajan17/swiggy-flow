import { useNavigate } from "react-router-dom";
import { ParticleBackground } from "@/components/layout/ParticleBackground";
import { AuthCard } from "@/components/layout/AuthCard";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { SlackAuthButton } from "@/components/auth/SlackAuthButton";
import { DiscordAuthButton } from "@/components/auth/DiscordAuthButton";
import { ChannelSelector } from "@/components/auth/ChannelSelector";
import { DiscordChannelSelector } from "@/components/auth/DiscordChannelSelector";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useOAuthFlow } from "@/hooks/useOAuthFlow";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    googleConnected,
    slackConnected,
    discordConnected,
    channelSelected,
    shouldRedirectToDashboard,
  } = useAuthStore();

  useOAuthFlow();

  // Don't auto-redirect - let user click the button instead
  const canAccessDashboard = shouldRedirectToDashboard();

  const getSteps = () => {
    const steps = [
      {
        number: 1,
        label: "Google",
        status: googleConnected
          ? ("completed" as const)
          : ("active" as const),
      },
      {
        number: 2,
        label: "Slack/Discord",
        status: slackConnected || discordConnected
          ? ("completed" as const)
          : googleConnected
          ? ("active" as const)
          : ("inactive" as const),
      },
      {
        number: 3,
        label: "Channel",
        status: channelSelected || discordConnected
          ? ("completed" as const)
          : slackConnected
          ? ("active" as const)
          : ("inactive" as const),
      },
    ];

    return steps;
  };

  return (
    <>
      <ParticleBackground />
      <AuthCard>
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-[#ffd89b] to-[#ff8c3a] rounded-[14px] flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 2L20.5 11H28L21.5 16L24 25H16L9.5 20L2.5 24L5.5 15L-2 10H6L16 2Z"
                fill="white"
              />
            </svg>
          </div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">
            Swiggy Insights
          </h1>
          <p className="text-sm text-gray-600">
            Connect your accounts to get started
          </p>
        </div>

        <StepIndicator steps={getSteps()} />

        <div className="bg-[#fff9f5] border border-[#ffd89b] rounded-[10px] p-3.5 mb-6">
          <p className="text-xs text-gray-600 leading-relaxed">
            We need <strong className="text-[#ff8c3a]">Google and either Slack or Discord</strong> to send you spending
            insights directly to your workspace
          </p>
        </div>

        <div className="space-y-7">
          <div className="space-y-3">
            <div className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
              Step 1: Connect Gmail
            </div>
            <GoogleAuthButton />
          </div>

          <div className="space-y-3">
            <div className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
              Step 2: Connect Slack or Discord
            </div>
            <SlackAuthButton />
            <DiscordAuthButton />
          </div>

          <ChannelSelector />
          <DiscordChannelSelector />
        </div>

        <div className="mt-6 text-center text-[11px] text-gray-400 leading-relaxed">
          By connecting your accounts, you agree to our{" "}
          <a href="#terms" className="text-[#ff8c3a] font-semibold hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#privacy" className="text-[#ff8c3a] font-semibold hover:underline">
            Privacy Policy
          </a>
          . Your data is never shared.
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {canAccessDashboard && (
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              Continue to Dashboard →
            </Button>
          )}
          {user && (
            <Button
              onClick={logout}
              variant="destructive"
              className="w-full"
            >
              Logout
            </Button>
          )}
        </div>
      </AuthCard>
    </>
  );
}
