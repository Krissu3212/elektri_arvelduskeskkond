import type {
  AiRecommendation,
  EfficiencyInsight,
  PatternInsight,
} from "../lib/types";
import { Sparkles, Brain } from "lucide-react";

interface Props {
  insights: PatternInsight[];
  efficiency: EfficiencyInsight;
  aiInsights?: AiRecommendation | null;
}

export function PatternPanel({ insights, efficiency, aiInsights }: Props) {
  if (aiInsights) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-indigo-500" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
              aruandluskeskkond · OpenAI
            </p>
            <p className="text-xs text-slate-500">
              Eleringi hinnaseeria analüüsitud {new Date(aiInsights.generatedAt).toLocaleString("et-EE")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/30">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Trendifookus</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{aiInsights.summary}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                Võimalused optimeerimiseks
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {aiInsights.opportunities.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {aiInsights.cautions.length > 0 && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5 dark:border-rose-900/50 dark:bg-rose-950/20">
                <p className="text-sm font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-200">
                  Riskid ja tähelepanekud
                </p>
                <ul className="mt-3 space-y-2 text-sm text-rose-700 dark:text-rose-100">
                  {aiInsights.cautions.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-indigo-900 p-5 text-white shadow-inner dark:from-slate-800 dark:to-indigo-800">
            <p className="text-sm uppercase tracking-wide text-white/70">Järgmised sammud</p>
            <ul className="mt-4 space-y-3 text-sm text-white/90">
              {aiInsights.actions.map((action) => (
                <li key={action} className="flex gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                    →
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

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

