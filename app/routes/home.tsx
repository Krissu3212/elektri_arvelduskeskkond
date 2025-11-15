import { useMemo, useState } from "react";
import type { Route } from "./+types/home";
import { fetchNordPoolPrices } from "../lib/elering";
import {
  detectPriceAnomalies,
  extractPatternInsights,
  calculateEfficiency,
  smoothSeries,
} from "../lib/ml";
import { buildReportPreview } from "../lib/reporting";
import type { GridMetric, InvoiceComparison } from "../lib/types";
import { MetricCard } from "../components/metric-card";
import { PriceTrendChart } from "../components/price-trend-chart";
import { AnomalyPanel } from "../components/anomaly-panel";
import { InvoiceUpload } from "../components/invoice-upload";
import { ComparisonTable } from "../components/comparison-table";
import { PatternPanel } from "../components/pattern-panel";
import { ReportPreviewCard } from "../components/report-preview";
import { ReportScheduleForm } from "../components/report-schedule-form";
import { IntegrationPanel } from "../components/integration-panel";
import { IndicatorChartCard } from "../components/indicator-chart";
import { generateConsumptionInsights } from "../lib/ai.server";

export async function loader() {
  const priceSeries = await fetchNordPoolPrices(["ee"], 48);
  const aiRecommendations = await generateConsumptionInsights(priceSeries);
  return {
    priceSeries,
    generatedAt: new Date().toISOString(),
    aiRecommendations,
  };
}

export function meta() {
  return [
    { title: "Elektri Arveldusmootor · Reaalajas aruandlusplatvorm" },
    {
      name: "description",
      content:
        "Automaatne aruandlussüsteem, mis liidab Eleringi reaalaja andmed, CSV elektriarved, masinõppe leiud ja API integratsioonid.",
    },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { priceSeries, generatedAt, aiRecommendations } = loaderData;
  const [comparisons, setComparisons] = useState<InvoiceComparison[]>([]);

  const latestPoint = priceSeries.at(-1);
  const previousPoint = priceSeries.at(-2);
  const averagePrice =
    priceSeries.reduce((acc, point) => acc + point.price, 0) /
    Math.max(priceSeries.length, 1);
  const peakPrice = priceSeries.reduce(
    (acc, point) => (point && acc && point.price > acc.price ? point : acc),
    priceSeries[0],
  );
  const stdDev = Math.sqrt(
    priceSeries.reduce((acc, point) => acc + Math.pow(point.price - averagePrice, 2), 0) /
      Math.max(priceSeries.length, 1),
  );

  const anomalies = useMemo(() => detectPriceAnomalies(priceSeries), [priceSeries]);
  const insights = useMemo(() => extractPatternInsights(priceSeries), [priceSeries]);
  const efficiency = useMemo(() => calculateEfficiency(priceSeries), [priceSeries]);
  const smoothed = useMemo(() => smoothSeries(priceSeries), [priceSeries]);
  const report = useMemo(
    () => buildReportPreview(anomalies, efficiency, comparisons),
    [anomalies, efficiency, comparisons],
  );

  const priceTrend: GridMetric["trend"] =
    latestPoint && previousPoint
      ? latestPoint.price > previousPoint.price
        ? "up"
        : latestPoint.price < previousPoint.price
          ? "down"
          : "stable"
      : undefined;

  const volatilityTrend: GridMetric["trend"] =
    anomalies.length > 2 ? "up" : anomalies.length === 0 ? "down" : "stable";

  const gridMetrics: GridMetric[] = [
    {
      label: "Viimase tunni hind",
      value: latestPoint ? `${latestPoint.price.toFixed(2)} €/MWh` : "—",
      delta:
        latestPoint && previousPoint
          ? `${(latestPoint.price - previousPoint.price).toFixed(2)} €/MWh`
          : undefined,
      trend: priceTrend,
    },
    {
      label: "48h keskmine",
      value: `${averagePrice.toFixed(2)} €/MWh`,
      delta: `${stdDev.toFixed(1)} €/MWh hajuvus`,
      trend: "stable" as const,
    },
    {
      label: "Tipphind",
      value: `${peakPrice?.price?.toFixed(2) ?? "0"} €/MWh`,
      delta: peakPrice?.isoTime
        ? new Date(peakPrice.isoTime).toLocaleString("et-EE", {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
      trend: "up" as const,
    },
    {
      label: "Volatiilsus",
      value: `${((stdDev / (averagePrice || 1)) * 100 || 0).toFixed(1)}%`,
      delta: `${anomalies.length} kõrvalekallet`,
      trend: volatilityTrend,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-10 font-[var(--font-sans)] dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 lg:px-0">
        <header className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm shadow-slate-100 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-black/20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Elektri arveldusmootor</p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white">
            Elektri Arveldusmootor  
          </h1>
          <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            Võrdle oma elektritarbimist Eleringi turuhinnaga. Saad kuvada reaalajas hinnakõver, kõrvalekalded ja efektiivsuse hinnanguid.
          </p>
          <div className="text-xs uppercase text-slate-400 dark:text-slate-500">
            Andmed lähtestatud {new Date(generatedAt).toLocaleString("et-EE")}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gridMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Reaalajas hinnakõver</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">Elering · EE piirkond</p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Andmepunktid: {priceSeries.length.toLocaleString("et-EE")}
              </p>
            </div>
            <div className="mt-4">
              <PriceTrendChart data={priceSeries} smoothedValues={smoothed} />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-sm font-semibold text-slate-500">Kõrvalekalded</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {anomalies.length} tuvastatud sündmust
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Masinõppe mudel kasutab Z-skoori ja libisevaid aknaid, et märgata tootmise efektiivsuse muutusi.
            </p>
            <div className="mt-4">
              <AnomalyPanel anomalies={anomalies} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <IndicatorChartCard
            title="Taastuvenergia tootmine"
            subtitle="Elering KE21 · kuu keskmine tootmine"
            sourceFile="/KE21_20251115-190001.csv"
            description="Hüdro-, tuule- ja päikeseenergia tootmine ning nende kõrvalekalded kuu kaupa."
            unit="GWh"
          />
          <IndicatorChartCard
            title="Elektri import ja eksport"
            subtitle="Elering KE21 · elektrikaubandus"
            sourceFile="/KE21_20251115-204342.csv"
            description="Võrdleb impordi ja ekspordi mahte ning märgib bilansi anomaaliad."
            unit="GWh"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <InvoiceUpload marketSeries={priceSeries} onComparison={(rows) => setComparisons(rows)} />
          <ComparisonTable rows={comparisons} />
        </section>

        <PatternPanel
          insights={insights}
          efficiency={efficiency}
          aiInsights={aiRecommendations}
        />

        <section className="grid gap-6 lg:grid-cols-2">
          <ReportPreviewCard report={report} />
          <ReportScheduleForm />
        </section>

        <IntegrationPanel
          endpoint={`${
            typeof window !== "undefined" && window.location.origin ? window.location.origin : ""
          }/api/reports`}
          token="sk_live_elering_xxxxxxxxxx"
        />
      </div>
    </div>
  );
}
