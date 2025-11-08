import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardData } from "@/types/dashboard.types";

interface SpendingCardProps {
  data: DashboardData;
}

export function SpendingCard({ data }: SpendingCardProps) {
  return (
    <Card className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[20px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-white border-0">
      <div className="text-sm opacity-90 mb-2">
        {data.month} Spending
      </div>
      <div className="text-5xl font-bold mb-1">₹{data.total_spending.toLocaleString()}</div>
      <div className="flex items-center gap-2 text-sm opacity-95">
        <Calendar size={16} />
        <span>
          {data.total_orders} orders • {data.days_tracked} days
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
        <div>
          <div className="text-[13px] opacity-80 mb-1">Avg. Order Value</div>
          <div className="text-2xl font-semibold">₹{data.avg_order_value}</div>
        </div>
        <div>
          <div className="text-[13px] opacity-80 mb-1">Daily Spend</div>
          <div className="text-2xl font-semibold">₹{data.daily_spend}</div>
        </div>
      </div>
    </Card>
  );
}
