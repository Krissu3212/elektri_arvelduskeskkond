import type { EfficiencyInsight, PatternInsight } from "../lib/types";
import { Sparkles } from "lucide-react";

interface Props {
  insights: PatternInsight[];
  efficiency: EfficiencyInsight;
}

export function PatternPanel({ insights, efficiency }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Masinõppe järeldused</p>
          <p className="text-xs text-slate-500">
            Mustrid, kõrvalekalded ja efektiivsuse muutused viimase 48h andmete põhjal
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-indigo-900 p-5 text-white shadow-inner dark:from-slate-800 dark:to-indigo-800">
          <p className="text-sm uppercase tracking-wide text-white/70">Efektiivsuse indeks</p>
          <p className="mt-2 text-4xl font-semibold">{efficiency.efficiencyScore}</p>
          <p className="text-sm text-white/80">{efficiency.patternLabel}</p>
          <p className="mt-3 text-xs text-white/70">
            Muutus {(efficiency.changePct * 100).toFixed(1)}% võrreldes eelmise perioodiga
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {efficiency.recommendations.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.title}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/30"
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{insight.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{insight.description}</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  insight.impact === "positive"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
                    : insight.impact === "negative"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-100"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {insight.impact === "positive"
                  ? "Parandamise võimalus"
                  : insight.impact === "negative"
                    ? "Hoia fookus"
                    : "Informatiivne"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

