import { Code2, Copy } from "lucide-react";
import { useState } from "react";

interface Props {
  endpoint: string;
  token: string;
}

export function IntegrationPanel({ endpoint, token }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy(value: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <Code2 className="h-4 w-4" />
        API integratsioon raamatupidamisega
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Ühenda e-arveldaja või haldussüsteem, kutsudes allolevat REST lõiku koos Bearer võtmega.
      </p>
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white/90 p-4 text-sm dark:border-slate-700 dark:bg-slate-950/40">
        <p className="font-semibold text-slate-700 dark:text-white">POST {endpoint}</p>
        <pre className="overflow-x-auto rounded-lg bg-slate-900/90 p-3 text-xs text-white">
{`{
  "externalInvoiceId": "ER-2025-0012",
  "periodStart": "2025-02-01",
  "periodEnd": "2025-02-28",
  "energyMWh": 118.5,
  "totalCostEUR": 8120.0
}`}
        </pre>
        <button
          type="button"
          onClick={() => handleCopy(endpoint)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Kopeeritud" : "Kopeeri lõik"}
        </button>
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Kasuta päises:
        <code className="mt-1 block rounded bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          Authorization: Bearer {token}
        </code>
      </div>
    </div>
  );
}

