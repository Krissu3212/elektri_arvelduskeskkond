import type { InvoiceComparison } from "../lib/types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ComparisonTableProps {
  rows: InvoiceComparison[];
}

export function ComparisonTable({ rows }: ComparisonTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400">
        Laadi CSV fail, et näha arve ja turu hinna võrdlust.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50/60 text-left font-medium text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
          <tr>
            <th className="px-5 py-3">Kuu</th>
            <th className="px-5 py-3">Arve €/MWh</th>
            <th className="px-5 py-3">Turuhind €/MWh</th>
            <th className="px-5 py-3 text-right">Kõrvalekalle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {rows.map((row) => (
            <tr key={row.month}>
              <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{row.month}</td>
              <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{row.billed.toFixed(2)}</td>
              <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{row.market.toFixed(2)}</td>
              <td className="px-5 py-3 text-right">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    row.variance > 0
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-100"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-100"
                  }`}
                >
                  {row.variance > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {row.variance > 0 ? "+" : ""}
                  {row.variance.toFixed(2)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

