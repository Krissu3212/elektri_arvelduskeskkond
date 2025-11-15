import type {
  AnomalyPoint,
  EfficiencyInsight,
  EnergyPricePoint,
  IndicatorAnomaly,
  IndicatorPoint,
  PatternInsight,
} from "./types";

function rollingAverage(values: number[], window = 6): number[] {
  return values.map((_, idx) => {
    const slice = values.slice(Math.max(0, idx - window + 1), idx + 1);
    const sum = slice.reduce((acc, value) => acc + value, 0);
    return sum / slice.length;
  });
}

function standardDeviation(values: number[], mean: number): number {
  const variance =
    values.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}

export function detectPriceAnomalies(
  series: EnergyPricePoint[],
): AnomalyPoint[] {
  if (series.length === 0) return [];
  const values = series.map((point) => point.price);
  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  const std = standardDeviation(values, mean) || 1;

  return series
    .map((point) => {
      const zScore = (point.price - mean) / std;
      const severity =
        Math.abs(zScore) > 2.5
          ? "high"
          : Math.abs(zScore) > 1.8
            ? "medium"
            : "low";
      return {
        isoTime: point.isoTime,
        price: point.price,
        zScore,
        severity,
        note:
          severity === "low"
            ? "Normaalne turukäitumine"
            : point.price > mean
              ? "Hind märkimisväärselt turu keskmisest kõrgem"
              : "Hind märkimisväärselt turu keskmisest madalam",
      } satisfies AnomalyPoint;
    })
    .filter((point) => point.severity !== "low");
}

export function extractPatternInsights(
  series: EnergyPricePoint[],
): PatternInsight[] {
  if (series.length < 12) {
    return [
      {
        title: "Piiratud ajalugu",
        description:
          "Keskmisest lühem ajalugu – täpsemate järelduste jaoks laadi vähemalt 12 tundi andmeid.",
        impact: "neutral",
      },
    ];
  }

  const byHour = new Map<number, number[]>();
  series.forEach((point) => {
    const hour = new Date(point.isoTime).getHours();
    const bucket = byHour.get(hour) ?? [];
    bucket.push(point.price);
    byHour.set(hour, bucket);
  });

  const hourlyMeans = Array.from(byHour.entries()).map(([hour, values]) => ({
    hour,
    avg: values.reduce((acc, value) => acc + value, 0) / values.length,
  }));
  const sorted = hourlyMeans.sort((a, b) => b.avg - a.avg);

  const peak = sorted[0];
  const valley = sorted.at(-1);

  return [
    {
      title: "Tipphindade aken",
      description: `Kõrgeim hind keskmiselt kell ${peak.hour
        .toString()
        .padStart(2, "0")}:00 - optimeeri tarbimine väljapoole seda akent.`,
      impact: "negative",
    },
    valley && {
      title: "Soodne tootmisaken",
      description: `Madalaim hind keskmiselt kell ${valley.hour
        .toString()
        .padStart(2, "0")}:00 - sobiv aeg salvestamiseks või tarbimise kasvatamiseks.`,
      impact: "positive",
    },
  ].filter(Boolean) as PatternInsight[];
}

export function calculateEfficiency(series: EnergyPricePoint[]): EfficiencyInsight {
  if (series.length === 0) {
    return {
      efficiencyScore: 50,
      patternLabel: "Ebapiisav andmestik",
      changePct: 0,
      recommendations: ["Laadi rohkem Eleringi andmeid analüüsi jaoks."],
    };
  }

  const firstHalf = series.slice(0, Math.floor(series.length / 2));
  const secondHalf = series.slice(Math.floor(series.length / 2));

  const avg = (points: EnergyPricePoint[]) =>
    points.reduce((acc, point) => acc + point.price, 0) / points.length;

  const trend = avg(secondHalf) - avg(firstHalf);
  const efficiencyScore = Math.max(
    10,
    Math.min(100, 80 - trend * 0.6 + Math.random() * 5),
  );

  return {
    efficiencyScore: Number(efficiencyScore.toFixed(1)),
    patternLabel: trend > 2 ? "Kulud kasvavad" : trend < -2 ? "Kulud vähenevad" : "Stabiilne",
    changePct: Number((trend / avg(firstHalf || series) || 0).toFixed(2)),
    recommendations:
      trend > 2
        ? [
            "Vaata üle tippkoormused ja käivita koormuse nihutamise reeglid.",
            "Kaalu täiendavat salvestusvõimsust hinnatipu vältimiseks.",
          ]
        : [
            "Hoiame kursil – jälgi kõrvalekaldeid, et trend säiliks.",
            "Võimalus müüa ülejäävat tootmist soodsal hinnal.",
          ],
  };
}

export function smoothSeries(series: EnergyPricePoint[]): number[] {
  const values = series.map((point) => point.price);
  return rollingAverage(values, 4);
}

export function detectIndicatorAnomalies(
  points: IndicatorPoint[],
): IndicatorAnomaly[] {
  if (points.length === 0) return [];

  const values = points.map((point) => point.value);
  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  const std = standardDeviation(values, mean) || 1;

  return points
    .map((point) => {
      const zScore = (point.value - mean) / std;
      const severity =
        Math.abs(zScore) > 2.2
          ? "high"
          : Math.abs(zScore) > 1.6
            ? "medium"
            : "low";

      return {
        ...point,
        zScore,
        severity,
        direction: zScore >= 0 ? "up" : "down",
      } satisfies IndicatorAnomaly;
    })
    .filter((point) => Math.abs(point.zScore) > 1.2);
}

