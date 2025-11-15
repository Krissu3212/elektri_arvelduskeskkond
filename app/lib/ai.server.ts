import type { AiRecommendation, EnergyPricePoint } from "./types";
import { getServerEnv } from "./env.server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

function summarizeSeries(series: EnergyPricePoint[]) {
  if (series.length === 0) {
    return {
      average: 0,
      peak: 0,
      peakTime: "",
      min: 0,
      minTime: "",
    };
  }
  const average =
    series.reduce((acc, point) => acc + point.price, 0) / series.length;
  const peakPoint = series.reduce((max, point) =>
    point.price > max.price ? point : max,
  );
  const minPoint = series.reduce((min, point) =>
    point.price < min.price ? point : min,
  );

  return {
    average,
    peak: peakPoint.price,
    peakTime: peakPoint.isoTime,
    min: minPoint.price,
    minTime: minPoint.isoTime,
  };
}

function buildPrompt(series: EnergyPricePoint[]) {
  const summary = summarizeSeries(series);
  const lastPoints = series.slice(-12).map((point) => ({
    time: point.isoTime,
    price: point.price,
  }));

  return `You are aruandluskeskkond, an Estonian energy analyst.
You receive hourly Nord Pool price data from Elering in €/MWh.

Dataset summary:
- Data points: ${series.length}
- Average price: ${summary.average.toFixed(2)} €/MWh
- Peak price: ${summary.peak.toFixed(2)} €/MWh at ${summary.peakTime}
- Low price: ${summary.min.toFixed(2)} €/MWh at ${summary.minTime}
- Recent 12 hours (newest last):
${lastPoints
  .map((point) => `  • ${point.time}: ${point.price.toFixed(2)} €/MWh`)
  .join("\n")}

Task:
1. Explain the key trend in under 3 sentences.
2. List 2-3 opportunities to optimize consumption or storage.
3. List 2-3 cautions/risks that the user must watch.
4. Provide 3 concrete next actions (short imperatives).

Respond in Estonian and keep bullets concise.`;
}

export async function generateConsumptionInsights(
  series: EnergyPricePoint[],
): Promise<AiRecommendation | null> {
  const apiKey = getServerEnv("OPENAI_API_KEY");
  if (!apiKey) {
    console.warn("[generateConsumptionInsights] Missing OPENAI_API_KEY");
    return null;
  }
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are aruandluskeskkond, a senior energy analyst focusing on Estonian electricity markets.",
          },
          {
            role: "user",
            content: buildPrompt(series),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API responded with ${response.status}: ${await response.text()}`,
      );
    }

    const payload = await response.json();
    const content: string =
      payload?.choices?.[0]?.message?.content ?? "Analüüs ei olnud kättesaadav.";

    const sections = content.split("\n").filter((line: string) => line.trim());
    const summary = sections.find((line: string) =>
      line.toLowerCase().includes("trend"),
    );
    const opportunities = sections
      .filter((line: string) => line.includes("võimalus") || line.includes("→"))
      .slice(0, 3);
    const cautions = sections
      .filter((line: string) => line.includes("risk") || line.includes("⚠"))
      .slice(0, 3);
    const actions = sections
      .filter((line: string) => line.trim().startsWith("-"))
      .map((line: string) => line.replace(/^-\s*/, ""))
      .slice(0, 3);

    return {
      summary: summary ?? sections[0] ?? "Analüüs kättesaadav.",
      opportunities: opportunities.length > 0 ? opportunities : sections.slice(1, 4),
      cautions,
      actions:
        actions.length > 0
          ? actions
          : ["Optimeeri tarbimisgraafik", "Planeeri salvestus", "Hinda tariife"],
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[generateConsumptionInsights]", error);
    return null;
  }
}

