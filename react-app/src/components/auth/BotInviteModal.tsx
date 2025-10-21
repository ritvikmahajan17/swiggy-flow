import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DISCORD_BOT_INVITE_URL } from "@/lib/constants";

interface BotInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverName: string;
  onVerify: () => void;
  verifying: boolean;
}

export function BotInviteModal({
  open,
  onOpenChange,
  serverName,
  onVerify,
  verifying,
}: BotInviteModalProps) {
  const handleAddBot = () => {
    // Open Discord bot invite link in new tab
    window.open(DISCORD_BOT_INVITE_URL, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 71 55">
              <path
                fill="#5865F2"
                d="M60.105 4.898A58.55 58.55 0 0 0 45.653.415a.22.22 0 0 0-.233.11 40.784 40.784 0 0 0-1.8 3.697c-5.456-.817-10.886-.817-16.23 0-.485-1.164-1.201-2.587-1.828-3.697a.228.228 0 0 0-.233-.11 58.386 58.386 0 0 0-14.451 4.483.207.207 0 0 0-.095.082C1.578 18.73-.944 32.144.293 45.39a.244.244 0 0 0 .093.167c6.073 4.46 11.955 7.167 17.729 8.962a.23.23 0 0 0 .249-.082 42.08 42.08 0 0 0 3.627-5.9.225.225 0 0 0-.123-.312 38.772 38.772 0 0 1-5.539-2.64.228.228 0 0 1-.022-.378c.372-.279.744-.569 1.1-.862a.22.22 0 0 1 .23-.03c11.619 5.304 24.198 5.304 35.68 0a.219.219 0 0 1 .233.027c.356.293.728.586 1.103.865a.228.228 0 0 1-.02.378 36.384 36.384 0 0 1-5.54 2.637.227.227 0 0 0-.121.315 47.249 47.249 0 0 0 3.624 5.897.225.225 0 0 0 .249.084c5.801-1.794 11.684-4.502 17.757-8.961a.228.228 0 0 0 .092-.164c1.48-15.315-2.48-28.618-10.497-40.412a.18.18 0 0 0-.093-.084Zm-36.38 32.427c-3.497 0-6.38-3.211-6.38-7.156 0-3.944 2.827-7.156 6.38-7.156 3.583 0 6.438 3.24 6.382 7.156 0 3.945-2.827 7.156-6.381 7.156Zm23.593 0c-3.498 0-6.38-3.211-6.38-7.156 0-3.944 2.826-7.156 6.38-7.156 3.582 0 6.437 3.24 6.38 7.156 0 3.945-2.798 7.156-6.38 7.156Z"
              />
            </svg>
            Add Bot to Server
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ Our bot needs to be added to <strong>{serverName}</strong> to send messages.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                <strong>Step 1:</strong> Click the button below to open Discord
              </p>
              <Button
                onClick={handleAddBot}
                className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white"
              >
                Add Bot to Discord Server
              </Button>

              <p className="text-sm text-gray-700">
                <strong>Step 2:</strong> Select <strong>{serverName}</strong> and authorize the bot
              </p>

              <p className="text-sm text-gray-700">
                <strong>Step 3:</strong> Come back here and click "Verify Bot"
              </p>

              <Button
                onClick={onVerify}
                disabled={verifying}
                className="w-full bg-[#ff8c3a] hover:bg-[#ff7a1f] text-white"
              >
                {verifying ? "Verifying..." : "Verify Bot & Save Channel"}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              The bot only needs "Send Messages" permission to work.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
