import { ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardData } from "@/types/dashboard.types";

interface SpendingBreakdownCardProps {
  data: DashboardData;
}

export function SpendingBreakdownCard({ data }: SpendingBreakdownCardProps) {
  // Calculate percentages
  const foodPercentage = data.total_spending > 0
    ? Math.round((data.food_spending / data.total_spending) * 100)
    : 0;
  const instamartPercentage = data.total_spending > 0
    ? Math.round((data.instamart_spending / data.total_spending) * 100)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-[#ff6b9d] via-[#c44569] to-[#8b3a62] rounded-2xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.1)] text-white border-0">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">Spending Split</h3>
        <ShoppingBag size={20} />
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span>Food Delivery</span>
            <span className="font-semibold">₹{data.food_spending.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-white/20 rounded overflow-hidden mb-1">
            <div
              className="h-full bg-white/90 rounded"
              style={{ width: `${foodPercentage}%` }}
            />
          </div>
          <div className="text-xs opacity-80">
            {foodPercentage}% • {data.food_orders_count} orders
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span>Instamart</span>
            <span className="font-semibold">₹{data.instamart_spending.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-white/20 rounded overflow-hidden mb-1">
            <div
              className="h-full bg-white/90 rounded"
              style={{ width: `${instamartPercentage}%` }}
            />
          </div>
          <div className="text-xs opacity-80">
            {instamartPercentage}% • {data.instamart_orders_count} orders
          </div>
        </div>
      </div>
    </Card>
  );
}
