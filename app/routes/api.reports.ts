import type { Route } from "./+types/api.reports";
import { z } from "zod";
import { fetchNordPoolPrices } from "../lib/elering";
import {
  calculateEfficiency,
  detectPriceAnomalies,
  extractPatternInsights,
} from "../lib/ml";
import { buildReportPreview } from "../lib/reporting";
import { compareInvoicesToMarket } from "../lib/comparison";

const invoiceSchema = z.object({
  externalInvoiceId: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  energyMWh: z.number().positive(),
  totalCostEUR: z.number().positive(),
});

export async function loader({ request }: Route.LoaderArgs) {
  const priceSeries = await fetchNordPoolPrices(["ee"], 24);
  const anomalies = detectPriceAnomalies(priceSeries);
  const efficiency = calculateEfficiency(priceSeries);
  const report = buildReportPreview(anomalies, efficiency, []);

  return Response.json({
    updatedAt: new Date().toISOString(),
    priceSeries,
    anomalies,
    efficiency,
    patternInsights: extractPatternInsights(priceSeries),
    nextReport: report,
    integrationDocs: {
      endpoint: new URL(request.url).origin + "/api/reports",
      requiredFields: invoiceSchema.keyof().options,
    },
  });
}

export async function action({ request }: Route.ActionArgs) {
  const payload = await request.json().catch(() => null);
  if (!payload) {
    return Response.json({ error: "Kehtetu JSON" }, { status: 400 });
  }

  const parsed = invoiceSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const priceSeries = await fetchNordPoolPrices(["ee"], 24);
  const comparison = compareInvoicesToMarket(
    [
      {
        id: parsed.data.externalInvoiceId,
        provider: "API",
        ...parsed.data,
      },
    ],
    priceSeries,
  );

  return Response.json({
    status: "accepted",
    comparison: comparison[0],
    stored: true,
  });
}

