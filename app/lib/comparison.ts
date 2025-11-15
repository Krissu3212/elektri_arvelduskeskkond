import { format } from "date-fns";
import type { EnergyPricePoint, InvoiceComparison, InvoiceRecord } from "./types";

export function compareInvoicesToMarket(
  invoices: InvoiceRecord[],
  market: EnergyPricePoint[],
): InvoiceComparison[] {
  if (invoices.length === 0 || market.length === 0) return [];

  const avgMarket = market.reduce((acc, point) => acc + point.price, 0) / market.length;

  return invoices.map((invoice) => {
    const billedUnit = invoice.totalCostEUR / Math.max(1, invoice.energyMWh);
    const variancePct = ((billedUnit - avgMarket) / avgMarket) * 100;
    return {
      month: format(invoice.periodStart ? new Date(invoice.periodStart) : new Date(), "MMMM yyyy"),
      billed: Number(billedUnit.toFixed(2)),
      market: Number(avgMarket.toFixed(2)),
      variance: Number(variancePct.toFixed(2)),
    };
  });
}

