import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BiggestSplurgeCard() {
  return (
    <Card className="bg-gradient-to-br from-[#a8edea] to-[#fed6e3] rounded-2xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.1)] text-gray-900 border-0 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Biggest Splurge</h3>
        <Award size={20} />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="text-[13px] opacity-70 mb-1">Single Order</div>
          <div className="text-[32px] font-bold mb-1">₹1,247</div>
          <div className="text-[13px] opacity-70">
            Dec 15, 2024 • Party order from Biryani Blues
          </div>
        </div>
        <div className="text-5xl">🏆</div>
      </div>

      {/* Blur overlay with Coming Soon */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/40 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 mb-2">Coming Soon</div>
          <div className="text-sm text-gray-700">Biggest splurge insights are on the way</div>
        </div>
      </div>
    </Card>
  );
}
