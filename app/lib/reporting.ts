import { format } from "date-fns";
import type {
  AnomalyPoint,
  EfficiencyInsight,
  InvoiceComparison,
  ReportPreview,
} from "./types";

export function buildReportPreview(
  anomalies: AnomalyPoint[],
  efficiency: EfficiencyInsight,
  invoiceVariance: InvoiceComparison[],
): ReportPreview {
  const nextDelivery = format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), "dd.MM.yyyy HH:mm");
  const avgVariance =
    invoiceVariance.reduce((acc, row) => acc + row.variance, 0) /
    (invoiceVariance.length || 1);

  return {
    title: "Automaatne tootmis- ja kuluaruanne",
    nextDelivery,
    deliveryCadenceLabel: "Iganädalane kokkuvõte",
    sections: [
      {
        title: "Masinõppe leid",
        body:
          anomalies.length > 0
            ? `Tuvastati ${anomalies.length} hinnakõikumist viimase 48h jooksul. Kõrgeim kõrvalekalle ${anomalies[0]!.price.toFixed(2)} €/MWh.`
            : "Kõrvalekaldeid ei tuvastatud – süsteem käitub stabiilselt.",
        indicator: anomalies.length > 0 ? "Tähelepanu" : "Stabiilne",
      },
      {
        title: "Efektiivsuse hinnang",
        body: `Üldskoor ${efficiency.efficiencyScore}/100 (${efficiency.patternLabel}). Muutus ${(efficiency.changePct * 100).toFixed(1)}%.`,
        indicator:
          efficiency.patternLabel === "Kulud kasvavad"
            ? "Negatiivne trend"
            : efficiency.patternLabel === "Kulud vähenevad"
              ? "Paranemine"
              : "Stabiilne",
      },
      {
        title: "Arvete võrdlus",
        body: `Keskmine erinevus turuhinnaga ${
          avgVariance > 0 ? "+" : ""
        }${avgVariance.toFixed(1)}%.`,
        indicator: avgVariance > 5 ? "Kontrolli lepingut" : "Normi piires",
      },
    ],
  };
}

