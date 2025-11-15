import { useState } from "react";
import { Clock } from "lucide-react";

interface ScheduleState {
  recipients: string;
  cadence: "päevas" | "nädalas" | "kuus";
  format: "pdf" | "xlsx" | "webhook";
}

export function ReportScheduleForm() {
  const [form, setForm] = useState<ScheduleState>({
    recipients: "omanikud@ettevote.ee",
    cadence: "nädalas",
    format: "pdf",
  });
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(
      `Raportid saadetakse ${form.cadence} formaadis ${form.format.toUpperCase()} adressaatidele ${form.recipients}`,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <Clock className="h-4 w-4" />
        Regulaarsed saatmised
      </div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Saajad
        <input
          value={form.recipients}
          onChange={(event) => setForm((prev) => ({ ...prev, recipients: event.target.value }))}
          placeholder="nimi@ettevote.ee, haldur@ettevote.ee"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950/30 dark:text-white"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Sagedus
        <select
          value={form.cadence}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, cadence: event.target.value as ScheduleState["cadence"] }))
          }
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950/30 dark:text-white"
        >
          <option value="päevas">Iga päev</option>
          <option value="nädalas">Iga nädal</option>
          <option value="kuus">Iga kuu</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Formaat
        <select
          value={form.format}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, format: event.target.value as ScheduleState["format"] }))
          }
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950/30 dark:text-white"
        >
          <option value="pdf">PDF</option>
          <option value="xlsx">Excel (XLSX)</option>
          <option value="webhook">Webhook</option>
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
      >
        Salvesta ajastus
      </button>
      {status && <p className="text-sm text-slate-500 dark:text-slate-400">{status}</p>}
    </form>
  );
}

