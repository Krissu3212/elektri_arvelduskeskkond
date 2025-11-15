import { Calendar, SendHorizonal } from "lucide-react";
import type { ReportPreview } from "../lib/types";

interface Props {
  report: ReportPreview;
}

export function ReportPreviewCard({ report }: Props) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-indigo-100/60 p-6 shadow-lg shadow-indigo-200/50 dark:border-indigo-900/60 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-950">
      <div className="flex items-center gap-3 text-sm text-indigo-700 dark:text-indigo-200">
        <Calendar className="h-4 w-4" />
        Järgmine edastus {report.nextDelivery} · {report.deliveryCadenceLabel}
      </div>
      <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{report.title}</h3>
      <div className="mt-6 space-y-4">
        {report.sections.map((section) => (
          <div key={section.title} className="rounded-xl bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-wide text-indigo-500">{section.indicator}</p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">{section.title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{section.body}</p>
          </div>
        ))}
      </div>
      <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">
        <SendHorizonal className="h-4 w-4" />
        Saada raport nüüd
      </button>
    </div>
  );
}

