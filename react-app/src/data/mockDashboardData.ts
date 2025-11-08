import type { OrderPatterns, BiggestSplurge } from "@/types/dashboard.types";

export const mockOrderPatterns: OrderPatterns = {
  ordersPerWeek: 11.3,
  mostActiveDay: "Fri",
  peakHour: "8-9PM",
};

export const mockBiggestSplurge: BiggestSplurge = {
  amount: 842,
  date: "Oct 15",
  description: "Dinner with friends",
};
