"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { HistoricalData } from "@/types/stock";
import { getHistoricalData } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface StockChartProps {
  symbol: string;
}

const PERIODS = [
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "1Y", value: "1Y" },
];

export function StockChart({ symbol }: StockChartProps) {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("1M");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const historicalData = await getHistoricalData(symbol, selectedPeriod);
        setData(historicalData);
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [symbol, selectedPeriod]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Price Chart - {symbol}</CardTitle>
          <div className="flex space-x-1">
            {PERIODS.map((period) => (
              <Button
                key={period.value}
                variant={
                  selectedPeriod === period.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <svg width="100%" height="100%" className="overflow-visible">
            <defs>
              <linearGradient
                id="priceGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="rgb(59, 130, 246)"
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor="rgb(59, 130, 246)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Chart area */}
            <g transform="translate(40, 20)">
              {/* Price line */}
              <path
                d={data
                  .map((point, index) => {
                    const x = (index / (data.length - 1)) * (100 - 10); // Leave margin
                    const y =
                      ((maxPrice - point.price) / priceRange) * (100 - 10);
                    return `${index === 0 ? "M" : "L"} ${x}% ${y}%`;
                  })
                  .join(" ")}
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />

              {/* Fill area under line */}
              <path
                d={[
                  data
                    .map((point, index) => {
                      const x = (index / (data.length - 1)) * (100 - 10);
                      const y =
                        ((maxPrice - point.price) / priceRange) * (100 - 10);
                      return `${index === 0 ? "M" : "L"} ${x}% ${y}%`;
                    })
                    .join(" "),
                  `L ${100 - 10}% ${100 - 10}%`,
                  "L 0% 90%",
                  "Z",
                ].join(" ")}
                fill="url(#priceGradient)"
              />
            </g>

            {/* Y-axis labels */}
            <g>
              <text
                x="5"
                y="30"
                fontSize="12"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {formatCurrency(maxPrice)}
              </text>
              <text
                x="5"
                y="50%"
                fontSize="12"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {formatCurrency((maxPrice + minPrice) / 2)}
              </text>
              <text
                x="5"
                y="90%"
                fontSize="12"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {formatCurrency(minPrice)}
              </text>
            </g>
          </svg>
        </div>

        {/* Chart summary */}
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <span>Period: {selectedPeriod}</span>
          <span>
            Range: {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
