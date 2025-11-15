import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EnergyPricePoint } from "../lib/types";

interface PriceTrendChartProps {
  data: EnergyPricePoint[];
  smoothedValues: number[];
}

export function PriceTrendChart({ data, smoothedValues }: PriceTrendChartProps) {
  const chartData = data.map((point, idx) => ({
    time: new Date(point.isoTime).toLocaleTimeString("et-EE", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: Number(point.price.toFixed(2)),
    smooth: Number(smoothedValues[idx]?.toFixed(2)),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f172a" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0f172a" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis
            unit=" €/MWh"
            tick={{ fontSize: 12 }}
            domain={["auto", "auto"]}
            tickFormatter={(tick) => tick.toFixed(0)}
          />
          <Tooltip
            labelStyle={{ fontWeight: 600 }}
            formatter={(value: number) => `${value.toFixed(2)} €/MWh`}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#0f172a"
            fillOpacity={1}
            fill="url(#priceGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="smooth"
            stroke="#22c55e"
            fillOpacity={0}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

