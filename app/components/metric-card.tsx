import { cn } from "../utils/cn";
import type { GridMetric } from "../lib/types";

const trendText: Record<NonNullable<GridMetric["trend"]>, string> = {
  up: "tõus",
  down: "langus",
  stable: "stabiilne",
};

export function MetricCard({ metric }: { metric: GridMetric }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm shadow-slate-100 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
      {metric.delta && (
        <p
          className={cn(
            "mt-1 text-sm font-medium",
            metric.trend === "down" && "text-rose-500",
            metric.trend === "up" && "text-emerald-500",
            metric.trend === "stable" && "text-slate-500",
          )}
        >
          {metric.delta} · {metric.trend ? trendText[metric.trend] : "muutus"}
        </p>
      )}
    </div>
  );
}

