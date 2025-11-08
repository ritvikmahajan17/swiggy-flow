export interface DashboardData {
  month: string;
  year: number;
  total_spending: number;
  total_orders: number;
  days_tracked: number;
  avg_order_value: number;
  daily_spend: number;
  food_orders_count: number;
  instamart_orders_count: number;
}

export interface OrderPatterns {
  ordersPerWeek: number;
  mostActiveDay: string;
  peakHour: string;
}

export interface SpendingBreakdown {
  foodDelivery: {
    amount: number;
    percentage: number;
    orders: number;
  };
  instamart: {
    amount: number;
    percentage: number;
    orders: number;
  };
}

export interface BiggestSplurge {
  amount: number;
  date: string;
  description: string;
}
