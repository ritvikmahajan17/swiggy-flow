import { ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SpendingBreakdownCard() {
  return (
    <Card className="bg-gradient-to-br from-[#ff6b9d] via-[#c44569] to-[#8b3a62] rounded-2xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.1)] text-white border-0 relative overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">Spending Split</h3>
        <ShoppingBag size={20} />
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span>Food Delivery</span>
            <span className="font-semibold">₹12,450</span>
          </div>
          <div className="h-2 bg-white/20 rounded overflow-hidden mb-1">
            <div
              className="h-full bg-white/90 rounded"
              style={{ width: '65%' }}
            />
          </div>
          <div className="text-xs opacity-80">
            65% • 42 orders
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span>Instamart</span>
            <span className="font-semibold">₹6,720</span>
          </div>
          <div className="h-2 bg-white/20 rounded overflow-hidden mb-1">
            <div
              className="h-full bg-white/90 rounded"
              style={{ width: '35%' }}
            />
          </div>
          <div className="text-xs opacity-80">
            35% • 23 orders
          </div>
        </div>
      </div>

      {/* Blur overlay with Coming Soon */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/20 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">Coming Soon</div>
          <div className="text-sm text-white/90">Spending breakdown insights are on the way</div>
        </div>
      </div>
    </Card>
  );
}
