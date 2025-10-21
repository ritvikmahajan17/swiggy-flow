import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#ffd89b] via-[#ffb366] to-[#ff8c3a]">
      <div className="w-full max-w-[480px] relative z-10">
        <Card className={cn("rounded-[20px] p-12 shadow-2xl bg-white", className)}>
          {children}
        </Card>
      </div>
    </div>
  );
}
