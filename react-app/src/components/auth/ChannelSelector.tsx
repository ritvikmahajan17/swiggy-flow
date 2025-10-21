import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useSlackChannels } from "@/hooks/useSlackChannels";

export function ChannelSelector() {
  const { slackConnected, channelSelected, userId } = useAuthStore();
  const {
    channels,
    loading,
    selectedChannelId,
    setSelectedChannelId,
    saveSelectedChannel,
  } = useSlackChannels();

  if (!slackConnected) return null;

  const handleSaveChannel = async () => {
    if (!userId) return;

    const success = await saveSelectedChannel(userId);
    if (success) {
      alert("Channel saved successfully!");
    } else {
      alert("Failed to save channel");
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
        Step 3: Select Channel
      </div>

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
    </div>
  );
}
