import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ParticleBackground } from "@/components/layout/ParticleBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const { slackConnected, discordConnected, selectedPlatform } = useAuthStore();

  useEffect(() => {
    // Only redirect if we're done loading and still no user
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const getPlatformText = () => {
    if (selectedPlatform === "slack" && slackConnected) {
      return "Slack Workspace Connected";
    }
    if (selectedPlatform === "discord" && discordConnected) {
      return "Discord Server Connected";
    }
    return "Platform Connected";
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <>
        <ParticleBackground />
        <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#ffd89b] via-[#ffb366] to-[#ff8c3a]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#ffd89b] via-[#ffb366] to-[#ff8c3a]">
        <div className="w-full max-w-[600px] relative z-10">
          <Card className="rounded-[20px] p-12 shadow-2xl text-center">
            <CardContent className="p-0 space-y-6">
              <motion.div
                className="w-20 h-20 mx-auto bg-gradient-to-br from-[#ffd89b] to-[#ff8c3a] rounded-[20px] flex items-center justify-center"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 2L20.5 11H28L21.5 16L24 25H16L9.5 20L2.5 24L5.5 15L-2 10H6L16 2Z"
                    fill="white"
                  />
                </svg>
              </motion.div>

              <h1 className="text-[32px] font-bold text-gray-900">
                Swiggy Insights Dashboard
              </h1>

              <Badge className="inline-flex items-center gap-2 px-5 py-2 bg-[#fff3e0] text-[#ff8c3a] border-0 text-sm font-semibold">
                🚧 Building in Progress
                <div className="flex gap-1 ml-2">
                  <motion.span
                    className="w-2 h-2 bg-[#ff8c3a] rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-[#ff8c3a] rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-[#ff8c3a] rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </Badge>

              <motion.div
                className="text-6xl"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🏗️
              </motion.div>

              <p className="text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                We're working hard to build your personalized spending insights
                dashboard.
                <br />
                Stay tuned for exciting features!
              </p>

              <div className="bg-gray-50 rounded-xl p-5 text-left">
                <div className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                  Your Connected Services
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600 font-bold" />
                    </div>
                    <span className="text-sm text-gray-700">
                      Google Account Connected
                    </span>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600 font-bold" />
                    </div>
                    <span className="text-sm text-gray-700">
                      {getPlatformText()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={logout}
                variant="destructive"
                className="mt-5"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
