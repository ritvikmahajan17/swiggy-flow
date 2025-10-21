import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useDiscordChannels } from "@/hooks/useDiscordChannels";
import { BotInviteModal } from "./BotInviteModal";

export function DiscordChannelSelector() {
  const { discordConnected, channelSelected, userId } = useAuthStore();
  const {
    servers,
    channels,
    loading,
    selectedServerId,
    setSelectedServerId,
    selectedChannelId,
    setSelectedChannelId,
    saveSelectedChannel,
    botPresent,
    checkingBot,
    recheckBotAndSave,
  } = useDiscordChannels();
  const [showBotInviteModal, setShowBotInviteModal] = useState(false);

  if (!discordConnected) return null;

  const handleSaveChannel = async () => {
    console.log("handleSaveChannel called with userId:", userId);
    if (!userId) {
      console.error("No userId available!");
      return;
    }

    const success = await saveSelectedChannel(userId);
    if (success) {
      alert("Channel saved successfully!");
    } else {
      // Bot not present, show invite modal
      setShowBotInviteModal(true);
    }
  };

  const handleVerifyBot = async () => {
    console.log("handleVerifyBot called with userId:", userId);
    if (!userId) {
      console.error("No userId available in handleVerifyBot!");
      return;
    }

    const success = await recheckBotAndSave(userId);
    if (success) {
      setShowBotInviteModal(false);
      alert("Bot verified! Channel saved successfully!");
    } else {
      alert("Bot not found in server yet. Please make sure you added the bot and try again.");
    }
  };

  const selectedServer = servers.find(s => s.id === selectedServerId);

  return (
    <div className="space-y-3">
      <div className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
        Step 3: Select Server & Channel
      </div>

      {/* Server Selector */}
      <Select
        value={selectedServerId}
        onValueChange={setSelectedServerId}
        disabled={loading || channelSelected}
      >
        <SelectTrigger className="w-full h-auto py-3.5 px-4 border-2 border-gray-200">
          <SelectValue
            placeholder={loading ? "Loading servers..." : "Select a Discord server..."}
          />
        </SelectTrigger>
        <SelectContent>
          {servers.map((server) => (
            <SelectItem key={server.id} value={server.id}>
              {server.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Channel Selector - Only show when server is selected */}
      {selectedServerId && (
        <Select
          value={selectedChannelId}
          onValueChange={setSelectedChannelId}
          disabled={loading || channelSelected}
        >
          <SelectTrigger className="w-full h-auto py-3.5 px-4 border-2 border-gray-200">
            <SelectValue
              placeholder={loading ? "Loading channels..." : "Select a channel..."}
            />
          </SelectTrigger>
          <SelectContent>
            {channels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                # {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {selectedChannelId && !channelSelected && (
        <Button
          onClick={handleSaveChannel}
          className="w-full bg-[#ff8c3a] hover:bg-[#ff7a1f] text-white border-[#ff8c3a]"
        >
          Save Channel
        </Button>
      )}

      {channelSelected && (
        <Button
          disabled
          className="w-full bg-green-600 text-white"
        >
          ✓ Channel Saved
        </Button>
      )}

      <BotInviteModal
        open={showBotInviteModal}
        onOpenChange={setShowBotInviteModal}
        serverName={selectedServer?.name || "your server"}
        onVerify={handleVerifyBot}
        verifying={checkingBot}
      />
    </div>
  );
}
