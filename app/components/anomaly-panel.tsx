import { AlertTriangle } from "lucide-react";
import type { AnomalyPoint } from "../lib/types";
import { cn } from "../utils/cn";

interface Props {
  anomalies: AnomalyPoint[];
}

export function AnomalyPanel({ anomalies }: Props) {
  if (anomalies.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-100">
        Süsteem on stabiilne – märkimisväärseid hinnakõikumisi ei tuvastatud.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {anomalies.slice(0, 4).map((point) => (
        <div
          key={point.isoTime}
          className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/70 p-3 shadow-sm shadow-rose-100/40 dark:border-rose-900/60 dark:bg-rose-950/40"
        >
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full",
              point.severity === "high" && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-100",
              point.severity === "medium" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-100",
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {new Date(point.isoTime).toLocaleString("et-EE", {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{point.note}</p>
          </div>
          <div className="text-right text-sm font-medium text-slate-900 dark:text-white">
            {point.price.toFixed(2)} €/MWh
          </div>
        </div>
      ))}
    </div>
  );
}

