import { useState } from "react";
import { Upload, Download } from "lucide-react";
import type { EnergyPricePoint, InvoiceComparison, InvoiceRecord } from "../lib/types";
import { parseInvoiceCsv } from "../lib/csv";
import { compareInvoicesToMarket } from "../lib/comparison";

interface InvoiceUploadProps {
  marketSeries: EnergyPricePoint[];
  onComparison: (rows: InvoiceComparison[]) => void;
}

export function InvoiceUpload({ marketSeries, onComparison }: InvoiceUploadProps) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setStatus("Laen CSV faili...");
      const parsed = await parseInvoiceCsv(file);
      setInvoices(parsed);
      const comparisons = compareInvoicesToMarket(parsed, marketSeries);
      onComparison(comparisons);
      setStatus(`Laaditud ${parsed.length} arvet`);
    } catch (error) {
      console.error(error);
      setStatus("CSV lugemisel tekkis viga");
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">Laadi elektriarved</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            CSV veerud: periodStart, periodEnd, provider, energyMWh, totalCostEUR
          </p>
        </div>
        <a
          href="/arve-naidis.csv"
          download
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Laadi näidis
        </a>
      </div>

      <label
        htmlFor="invoice-upload"
        className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-center text-sm text-slate-500 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
      >
        <Upload className="mb-2 h-6 w-6 text-slate-400" />
        <span>Vali või lohista CSV fail</span>
        <input
          id="invoice-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {status && <p className="text-sm text-slate-500 dark:text-slate-400">{status}</p>}

      {invoices.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50/60 text-left font-medium text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2">Periood</th>
                <th className="px-4 py-2">Teenusepakkuja</th>
                <th className="px-4 py-2 text-right">Energia (MWh)</th>
                <th className="px-4 py-2 text-right">Kogukulu (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-2">
                    {invoice.periodStart} – {invoice.periodEnd}
                  </td>
                  <td className="px-4 py-2">{invoice.provider}</td>
                  <td className="px-4 py-2 text-right">{invoice.energyMWh.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{invoice.totalCostEUR.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

