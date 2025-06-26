"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IntradayData } from "@/types/forex";
import { getIntradayData } from "@/lib/api";

interface ForexChartProps {
  fromSymbol: string;
  toSymbol: string;
}

const INTERVALS = [
  { label: "5min", value: "5min" },
  { label: "15min", value: "15min" },
  { label: "30min", value: "30min" },
  { label: "60min", value: "60min" },
];

export function ForexChart({ fromSymbol, toSymbol }: ForexChartProps) {
  const [data, setData] = useState<IntradayData[]>([]);
  const [selectedInterval, setSelectedInterval] = useState("5min");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const intradayData = await getIntradayData(
          fromSymbol,
          toSymbol,
          selectedInterval
        );
        setData(intradayData);
      } catch (error) {
        console.error("Failed to fetch intraday data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [fromSymbol, toSymbol, selectedInterval]);

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

  const minPrice = Math.min(...data.map((d) => d.low));
  const maxPrice = Math.max(...data.map((d) => d.high));
  const priceRange = maxPrice - minPrice;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-y-8 md:gap-y-[0px] items-center justify-between">
          <CardTitle>
            Price Chart - {fromSymbol}/{toSymbol}
          </CardTitle>
          <div className="flex space-x-1">
            {INTERVALS.map((interval) => (
              <Button
                key={interval.value}
                variant={
                  selectedInterval === interval.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedInterval(interval.value)}
              >
                {interval.label}
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
                  stopColor="rgb(34, 197, 94)"
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor="rgb(34, 197, 94)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Chart area */}
            <g transform="translate(60, 20)">
              {/* Price line */}
              <path
                d={data
                  .map((point, index) => {
                    const x = (index / (data.length - 1)) * (100 - 15); // Leave margin
                    const y =
                      ((maxPrice - point.close) / priceRange) * (100 - 10);
                    return `${index === 0 ? "M" : "L"} ${x}% ${y}%`;
                  })
                  .join(" ")}
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />

              {/* Fill area under line */}
              <path
                d={[
                  data
                    .map((point, index) => {
                      const x = (index / (data.length - 1)) * (100 - 15);
                      const y =
                        ((maxPrice - point.close) / priceRange) * (100 - 10);
                      return `${index === 0 ? "M" : "L"} ${x}% ${y}%`;
                    })
                    .join(" "),
                  `L ${100 - 15}% ${100 - 10}%`,
                  "L 0% 90%",
                  "Z",
                ].join(" ")}
                fill="url(#priceGradient)"
              />

              {/* Candlestick representation for forex */}
              {data.slice(0, Math.min(data.length, 50)).map((point, index) => {
                const x = (index / Math.min(data.length - 1, 49)) * (100 - 15);
                const openY =
                  ((maxPrice - point.open) / priceRange) * (100 - 10);
                const closeY =
                  ((maxPrice - point.close) / priceRange) * (100 - 10);
                const highY =
                  ((maxPrice - point.high) / priceRange) * (100 - 10);
                const lowY = ((maxPrice - point.low) / priceRange) * (100 - 10);

                const isGreen = point.close >= point.open;

                return (
                  <g key={index}>
                    {/* High-Low line */}
                    <line
                      x1={`${x}%`}
                      y1={`${highY}%`}
                      x2={`${x}%`}
                      y2={`${lowY}%`}
                      stroke={isGreen ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                      strokeWidth="1"
                    />
                    {/* Open-Close body */}
                    <rect
                      x={`${x - 0.5}%`}
                      y={`${Math.min(openY, closeY)}%`}
                      width="1%"
                      height={`${Math.abs(closeY - openY)}%`}
                      fill={isGreen ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                      opacity="0.7"
                    />
                  </g>
                );
              })}
            </g>

            {/* Y-axis labels */}
            <g>
              <text
                x="5"
                y="30"
                fontSize="10"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {maxPrice.toFixed(5)}
              </text>
              <text
                x="5"
                y="50%"
                fontSize="10"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {((maxPrice + minPrice) / 2).toFixed(5)}
              </text>
              <text
                x="5"
                y="90%"
                fontSize="10"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {minPrice.toFixed(5)}
              </text>
            </g>
          </svg>
        </div>

        {/* Chart summary */}
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <span>Interval: {selectedInterval}</span>
          <span>
            Range: {minPrice.toFixed(5)} - {maxPrice.toFixed(5)}
          </span>
          <span>Data Points: {data.length}</span>
        </div>
      </CardContent>
    </Card>
  );
}
