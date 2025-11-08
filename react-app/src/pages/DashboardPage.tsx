import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ParticleBackground } from "@/components/layout/ParticleBackground";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import type { DashboardData } from "@/types/dashboard.types";
import { SpendingCard } from "@/components/dashboard/SpendingCard";
import { OrderPatternsCard } from "@/components/dashboard/OrderPatternsCard";
import { SpendingBreakdownCard } from "@/components/dashboard/SpendingBreakdownCard";
import { BiggestSplurgeCard } from "@/components/dashboard/BiggestSplurgeCard";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const { selectedPlatform } = useAuthStore();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    // Only redirect if we're done loading and still no user
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Make API call when dashboard loads
    const fetchDashboardData = async () => {
      if (!user || !selectedPlatform) return;

      // Prevent multiple calls
      if (hasFetchedData.current) return;
      hasFetchedData.current = true;

      setDashboardLoading(true);
      try {
        const response = await fetch(
          "https://n8n-ritvik.onrender.com/webhook-test/dashboard",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              platform: selectedPlatform,
            }),
          }
        );

        if (!response.ok) {
          console.error("Dashboard API call failed:", response.statusText);
        }

        const data = await response.json();
        console.log("Dashboard data received:", data);

        // API returns an array with a single object
        if (Array.isArray(data) && data.length > 0) {
          setDashboardData(data[0]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, selectedPlatform]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <>
        <ParticleBackground />
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2]">
          <div className="text-gray-900 text-xl">Loading...</div>
        </div>
      </>
    );
  }

  // Show loading spinner while fetching dashboard data
  if (dashboardLoading || !dashboardData) {
    return (
      <>
        <ParticleBackground />
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <div className="text-gray-700 text-lg">Loading your insights...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen p-6 bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] relative overflow-hidden">
        <div className="max-w-[480px] mx-auto relative z-10 space-y-5">
          {/* Header with logout */}
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Your Swiggy Insights</h1>
            <Button onClick={logout} variant="destructive" size="sm">
              Logout
            </Button>
          </div>

          {/* Main spending card */}
          <SpendingCard data={dashboardData} />

          {/* Order frequency card */}
          <OrderPatternsCard />

          {/* Category breakdown */}
          <SpendingBreakdownCard />

          {/* Top spending insight */}
          <BiggestSplurgeCard />
        </div>
      </div>
    </>
  );
}
