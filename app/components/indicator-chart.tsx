import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { parseIndicatorCsv } from "../lib/indicators";
import { detectIndicatorAnomalies } from "../lib/ml";
import type { IndicatorAnomaly, IndicatorSeries } from "../lib/types";

interface IndicatorChartCardProps {
  title: string;
  subtitle: string;
  sourceFile: string;
  description?: string;
  unit?: string;
}

interface IndicatorChartState {
  loading: boolean;
  error?: string;
  series: IndicatorSeries[];
}

const SERIES_COLORS = ["#0f172a", "#6366f1", "#22c55e", "#f97316", "#ec4899"];

const SEVERITY_COLORS: Record<IndicatorAnomaly["severity"], string> = {
  low: "#38bdf8",
  medium: "#f97316",
  high: "#ef4444",
};

export function IndicatorChartCard({
  title,
  subtitle,
  sourceFile,
  description,
  unit,
}: IndicatorChartCardProps) {
  const [state, setState] = useState<IndicatorChartState>({
    loading: true,
    series: [],
  });

  useEffect(() => {
    let aborted = false;
    const resolvedSource = sourceFile.startsWith("/")
      ? sourceFile
      : `/${sourceFile}`;

    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    fetch(resolvedSource, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`CSV laadimine ebaõnnestus (${response.status})`);
        }
        return response.text();
      })
      .then((csv) => {
        if (aborted) return;
        setState({
          loading: false,
          error: undefined,
          series: parseIndicatorCsv(csv, unit),
        });
      })
      .catch((error: Error) => {
        if (aborted) return;
        setState({
          loading: false,
          series: [],
          error: error.message || "CSV faili ei saanud laadida.",
        });
      });

    return () => {
      aborted = true;
    };
  }, [sourceFile, unit]);

  const { series, loading, error } = state;
  const resolvedUnit = unit ?? series[0]?.unit ?? "GWh";

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    series.forEach((serie, idx) => {
      map.set(serie.key, SERIES_COLORS[idx % SERIES_COLORS.length]);
    });
    return map;
  }, [series]);

  const labelMap = useMemo(() => {
    const map = new Map<string, string>();
    series.forEach((serie) => map.set(serie.key, serie.label));
    return map;
  }, [series]);

  const chartData = useMemo(() => {
    if (series.length === 0) return [];
    const periods = series[0].points.map((point) => point.period);

    return periods.map((period, idx) => {
      const row: Record<string, string | number> = { period };
      series.forEach((serie) => {
        row[serie.key] = serie.points[idx]?.value ?? 0;
      });
      return row;
    });
  }, [series]);

  const { anomalyLookup, summaries } = useMemo(() => {
    const lookup = new Map<string, IndicatorAnomaly>();
    const summaries = series.map((serie) => {
      const anomalies = detectIndicatorAnomalies(serie.points);
      anomalies.forEach((anomaly) =>
        lookup.set(`${serie.key}-${anomaly.period}`, anomaly),
      );
      return {
        key: serie.key,
        label: serie.label,
        anomalies,
      };
    });

    return { anomalyLookup: lookup, summaries };
  }, [series]);

  const renderDot =
    (seriesKey: string, color: string) =>
    (props: {
      cx?: number;
      cy?: number;
      payload?: Record<string, string | number>;
    }) => {
      const { cx = 0, cy = 0, payload } = props;
      const period = typeof payload?.period === "string" ? payload.period : "";
      const anomaly = period
        ? anomalyLookup.get(`${seriesKey}-${period}`)
        : undefined;
      const radius = anomaly ? 6 : 3.5;
      const fill = anomaly
        ? SEVERITY_COLORS[anomaly.severity]
        : color ?? "#0f172a";

      return (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={fill}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      );
    };

  const tooltipFormatter = (value: number, name: string) => {
    const label = labelMap.get(name) ?? name;
    return [`${Number(value).toFixed(1)} ${resolvedUnit}`, label];
  };

  const labelFormatter = (label: string) => label;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">
          {title}
        </p>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      <div className="mt-4 h-72">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Laen Eleringi CSV andmeid…
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-rose-500">
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            CSV fail ei sisalda mõõdetavaid ridu.
          </div>
        ) : (
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis
                unit={` ${resolvedUnit}`}
                tick={{ fontSize: 12 }}
                tickFormatter={(tick) => tick.toFixed(0)}
              />
              <Tooltip
                formatter={tooltipFormatter as never}
                labelFormatter={labelFormatter}
              />
              {series.map((serie) => {
                const color = colorMap.get(serie.key) ?? "#0f172a";
                return (
                  <Area
                    key={serie.key}
                    type="monotone"
                    dataKey={serie.key}
                    name={serie.label}
                    stroke={color}
                    fillOpacity={0.18}
                    fill={color}
                    strokeWidth={2}
                    dot={renderDot(serie.key, color)}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {summaries.length > 0 && (
        <div className="mt-4 space-y-2">
          {summaries.map((summary) => {
            const color = colorMap.get(summary.key) ?? "#0f172a";
            const hasAnomalies = summary.anomalies.length > 0;
            const topSeverity: IndicatorAnomaly["severity"] | null =
              summary.anomalies.find((anomaly) => anomaly.severity === "high")
                ? "high"
                : summary.anomalies.find(
                      (anomaly) => anomaly.severity === "medium",
                    )
                  ? "medium"
                  : hasAnomalies
                    ? "low"
                    : null;
            const severityColor = topSeverity
              ? SEVERITY_COLORS[topSeverity]
              : undefined;

            return (
              <div
                key={summary.key}
                className="flex items-center justify-between rounded-2xl bg-slate-50/70 px-3 py-2 text-sm dark:bg-slate-900/40"
              >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {summary.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    {hasAnomalies ? (
                      <>
                        <span className="text-slate-500 dark:text-slate-400">
                          {summary.anomalies.length} kõrvalekallet
                        </span>
                        {severityColor && (
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: severityColor }}
                            title={`Kõrgeim tuvastatud tase: ${topSeverity}`}
                          />
                        )}
                      </>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        Stabiilne
                      </span>
                    )}
                  </div>
                </div>
              );
          })}
        </div>
      )}
    </div>
  );
}

