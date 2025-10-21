import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
  status: "active" | "completed" | "inactive";
}

interface StepIndicatorProps {
  steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-2 my-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0",
                step.status === "active" &&
                  "bg-gradient-to-br from-[#ffd89b] to-[#ff8c3a] text-white",
                step.status === "completed" && "bg-green-500 text-white",
                step.status === "inactive" && "bg-gray-200 text-gray-400"
              )}
            >
              {step.number}
            </div>
            <div
              className={cn(
                "text-xs font-semibold hidden md:block",
                step.status === "active" && "text-[#ff8c3a]",
                step.status === "completed" && "text-green-500",
                step.status === "inactive" && "text-gray-400"
              )}
            >
              {step.label}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="h-0.5 bg-gray-200 flex-1 -mx-1 hidden md:block" />
          )}
        </div>
      ))}
    </div>
  );
}
