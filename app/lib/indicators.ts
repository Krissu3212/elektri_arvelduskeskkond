import Papa from "papaparse";
import type { IndicatorSeries } from "./types";

const DEFAULT_UNIT = "GWh";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const sanitizeCell = (cell?: string) =>
  cell?.replace?.(/^"|"$/g, "").trim() ?? "";

const toNumber = (cell?: string) => {
  const normalized = sanitizeCell(cell).replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
};

export function parseIndicatorCsv(
  csv: string,
  unit = DEFAULT_UNIT,
): IndicatorSeries[] {
  if (!csv?.trim()) return [];

  const parsed = Papa.parse<string[]>(csv, {
    skipEmptyLines: true,
  });

  const rows = parsed.data.filter(
    (row): row is string[] =>
      Array.isArray(row) && row.some((cell) => sanitizeCell(cell).length > 0),
  );

  let headerIndex = rows.findIndex((row) => {
    const firstCell = sanitizeCell(row[0]).toLowerCase();
    return firstCell === "indicator" && row.length > 1;
  });
  if (headerIndex === -1) {
    const fallbackIndex = rows.findIndex((row) => row.length > 1);
    if (fallbackIndex === -1) return [];
    headerIndex = fallbackIndex;
  }

  const headerRow = rows[headerIndex];
  const periods = headerRow
    .slice(1)
    .map((period) => sanitizeCell(period))
    .filter(Boolean);

  const dataRows = rows.slice(headerIndex + 1).filter((row) => row.length > 1);
  if (dataRows.length === 0) {
    return [];
  }

  return dataRows
    .filter((row) => sanitizeCell(row[0]).length > 0)
    .map((row, idx) => {
      const label = sanitizeCell(row[0]) || `Indicator ${idx + 1}`;
      const key = slugify(label) || `indicator-${idx + 1}`;

      const points = periods.map((period, periodIdx) => ({
        period,
        value: toNumber(row[periodIdx + 1]),
      }));

      return {
        key,
        label,
        unit,
        points,
      } satisfies IndicatorSeries;
    });
}

