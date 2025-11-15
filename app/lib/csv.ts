import Papa, { type ParseResult } from "papaparse";
import type { InvoiceRecord } from "./types";

const REQUIRED_HEADERS = [
  "periodStart",
  "periodEnd",
  "provider",
  "energyMWh",
  "totalCostEUR",
] as const;

type RequiredHeader = (typeof REQUIRED_HEADERS)[number];

interface ParsedInvoiceRow {
  periodStart: string;
  periodEnd: string;
  provider: string;
  energyMWh: string;
  totalCostEUR: string;
}

export function parseInvoiceCsv(file: File): Promise<InvoiceRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<ParsedInvoiceRow>(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (result: ParseResult<ParsedInvoiceRow>) => {
        if (result.errors.length > 0) {
          return reject(result.errors[0]);
        }
        const invalid = REQUIRED_HEADERS.filter((header) => {
          return !result.meta.fields?.includes(header);
        });
        if (invalid.length > 0) {
          return reject(
            new Error(
              `Puuduvad kohustuslikud veerud: ${invalid.join(", ")}`,
            ),
          );
        }

        resolve(
          result.data.map((row: ParsedInvoiceRow) => ({
            id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
            periodStart: row.periodStart,
            periodEnd: row.periodEnd,
            provider: row.provider,
            energyMWh: Number(row.energyMWh),
            totalCostEUR: Number(row.totalCostEUR),
          })),
        );
      },
      error: (error: Error) => reject(error),
    });
  });
}

export function invoiceTemplate(): string {
  return [
    REQUIRED_HEADERS.join(","),
    "2025-01-01,2025-01-31,Enefit,120.5,8400.0",
    "2025-02-01,2025-02-28,Enefit,114.3,7990.0",
  ].join("\n");
}

