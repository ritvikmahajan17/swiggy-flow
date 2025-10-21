import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useOAuthFlow } from "@/hooks/useOAuthFlow";
import { DISCORD_BOT_INVITE_URL } from "@/lib/constants";

interface DiscordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscordModal({ open, onOpenChange }: DiscordModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const { userId, setDiscordConnected } = useAuthStore();
  const { storeDiscordConnection } = useOAuthFlow();

  const handleConfirm = async () => {
    if (!userId) {
      alert("Please login with Google first");
      return;
    }

    setSaving(true);
    const success = await storeDiscordConnection(userId);

    if (success) {
      setDiscordConnected(true);
      onOpenChange(false);
      setConfirmed(false);
    } else {
      alert("Failed to save Discord setup. Please try again.");
    }

    setSaving(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setConfirmed(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <svg width="28" height="28" viewBox="0 0 71 55">
              <path
                fill="#5865F2"
                d="M60.105 4.898A58.55 58.55 0 0 0 45.653.415a.22.22 0 0 0-.233.11 40.784 40.784 0 0 0-1.8 3.697c-5.456-.817-10.886-.817-16.23 0-.485-1.164-1.201-2.587-1.828-3.697a.228.228 0 0 0-.233-.11 58.386 58.386 0 0 0-14.451 4.483.207.207 0 0 0-.095.082C1.578 18.73-.944 32.144.293 45.39a.244.244 0 0 0 .093.167c6.073 4.46 11.955 7.167 17.729 8.962a.23.23 0 0 0 .249-.082 42.08 42.08 0 0 0 3.627-5.9.225.225 0 0 0-.123-.312 38.772 38.772 0 0 1-5.539-2.64.228.228 0 0 1-.022-.378c.372-.279.744-.569 1.1-.862a.22.22 0 0 1 .23-.03c11.619 5.304 24.198 5.304 35.68 0a.219.219 0 0 1 .233.027c.356.293.728.586 1.103.865a.228.228 0 0 1-.02.378 36.384 36.384 0 0 1-5.54 2.637.227.227 0 0 0-.121.315 47.249 47.249 0 0 0 3.624 5.897.225.225 0 0 0 .249.084c5.801-1.794 11.684-4.502 17.757-8.961a.228.228 0 0 0 .092-.164c1.48-15.315-2.48-28.618-10.497-40.412a.18.18 0 0 0-.093-.084Zm-36.38 32.427c-3.497 0-6.38-3.211-6.38-7.156 0-3.944 2.827-7.156 6.38-7.156 3.583 0 6.438 3.24 6.382 7.156 0 3.945-2.827 7.156-6.381 7.156Zm23.593 0c-3.498 0-6.38-3.211-6.38-7.156 0-3.944 2.826-7.156 6.38-7.156 3.582 0 6.437 3.24 6.38 7.156 0 3.945-2.798 7.156-6.38 7.156Z"
              />
            </svg>
            Add Discord Bot
          </DialogTitle>
          <DialogDescription>
            Follow these steps to add our bot to your Discord server
          </DialogDescription>
        </DialogHeader>

        <div className="bg-[#f5f6fe] border-2 border-[#5865f2] rounded-xl p-5 my-5 text-center">
          <p className="text-sm text-gray-600 mb-3">
            <strong>Step 1:</strong> Click the button below to invite our bot
          </p>
          <a
            href={DISCORD_BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865f2] text-white rounded-lg font-semibold hover:bg-[#4752c4] transition-all hover:-translate-y-0.5"
          >
            <svg width="20" height="20" viewBox="0 0 71 55">
              <path
                fill="currentColor"
                d="M60.105 4.898A58.55 58.55 0 0 0 45.653.415a.22.22 0 0 0-.233.11 40.784 40.784 0 0 0-1.8 3.697c-5.456-.817-10.886-.817-16.23 0-.485-1.164-1.201-2.587-1.828-3.697a.228.228 0 0 0-.233-.11 58.386 58.386 0 0 0-14.451 4.483.207.207 0 0 0-.095.082C1.578 18.73-.944 32.144.293 45.39a.244.244 0 0 0 .093.167c6.073 4.46 11.955 7.167 17.729 8.962a.23.23 0 0 0 .249-.082 42.08 42.08 0 0 0 3.627-5.9.225.225 0 0 0-.123-.312 38.772 38.772 0 0 1-5.539-2.64.228.228 0 0 1-.022-.378c.372-.279.744-.569 1.1-.862a.22.22 0 0 1 .23-.03c11.619 5.304 24.198 5.304 35.68 0a.219.219 0 0 1 .233.027c.356.293.728.586 1.103.865a.228.228 0 0 1-.02.378 36.384 36.384 0 0 1-5.54 2.637.227.227 0 0 0-.121.315 47.249 47.249 0 0 0 3.624 5.897.225.225 0 0 0 .249.084c5.801-1.794 11.684-4.502 17.757-8.961a.228.228 0 0 0 .092-.164c1.48-15.315-2.48-28.618-10.497-40.412a.18.18 0 0 0-.093-.084Zm-36.38 32.427c-3.497 0-6.38-3.211-6.38-7.156 0-3.944 2.827-7.156 6.38-7.156 3.583 0 6.438 3.24 6.382 7.156 0 3.945-2.827 7.156-6.381 7.156Zm23.593 0c-3.498 0-6.38-3.211-6.38-7.156 0-3.944 2.826-7.156 6.38-7.156 3.582 0 6.437 3.24 6.38 7.156 0 3.945-2.798 7.156-6.38 7.156Z"
              />
            </svg>
            Invite Bot to Discord
          </a>
        </div>

        <div className="bg-[#fff9f5] border border-[#ffd89b] rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            <strong>Step 2:</strong> Once you've added the bot, check the box
            below
          </p>
          <div className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="discord-confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 cursor-pointer accent-[#5865f2]"
            />
            <label
              htmlFor="discord-confirm"
              className="text-sm text-gray-900 cursor-pointer select-none"
            >
              I've successfully added the bot to my Discord server
            </label>
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!confirmed || saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold mt-4"
        >
          {saving ? "Saving..." : "Complete Discord Setup"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
