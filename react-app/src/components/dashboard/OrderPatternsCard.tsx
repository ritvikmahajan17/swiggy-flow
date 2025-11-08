import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

export function OrderPatternsCard() {
  return (
    <Card className="bg-white rounded-2xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-black/5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Patterns</h3>
        <Clock size={20} color="#667eea" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-4 bg-gradient-to-br from-[#667eea15] to-[#764ba215] rounded-xl border border-[#667eea20]">
          <div className="text-[28px] mb-2">📦</div>
          <div className="text-xl font-bold mb-1 text-[#667eea]">
            3.2
          </div>
          <div className="text-[11px] opacity-70 leading-[1.3]">
            orders per week
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-[#ff6b9d15] to-[#c4456915] rounded-xl border border-[#ff6b9d20]">
          <div className="text-[28px] mb-2">🎉</div>
          <div className="text-xl font-bold mb-1 text-[#ff6b9d]">
            Friday
          </div>
          <div className="text-[11px] opacity-70 leading-[1.3]">
            most active day
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-[#ffa50015] to-[#ff8c3a15] rounded-xl border border-[#ffa50020]">
          <div className="text-[28px] mb-2">🌙</div>
          <div className="text-xl font-bold mb-1 text-[#ff8c3a]">
            8 PM
          </div>
          <div className="text-[11px] opacity-70 leading-[1.3]">peak hour</div>
        </div>
      </div>

      {/* Blur overlay with Coming Soon */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/60 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 mb-2">Coming Soon</div>
          <div className="text-sm text-gray-600">Order pattern insights are on the way</div>
        </div>
      </div>
    </Card>
  );
}
