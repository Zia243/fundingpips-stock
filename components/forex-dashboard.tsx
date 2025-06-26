"use client";

import { useState } from "react";
import { ForexSearch } from "./forex-search";
import { ForexCard } from "./forex-card";
import { ForexChart } from "./forex-chart";
import { ForexWatchlist } from "./forex-watchlist";
import type { ForexPair } from "@/types/forex";
import { getForexPair } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForex } from "@/contexts/forex-context";
import { AlertCircle } from "lucide-react";

export function ForexDashboard() {
  const [selectedPair, setSelectedPair] = useState<ForexPair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError, clearError } = useForex();

  const handleSelectPair = async (fromSymbol: string, toSymbol: string) => {
    setIsLoading(true);
    clearError();

    try {
      const pair = await getForexPair(fromSymbol, toSymbol);
      console.log("pair", pair);

      if (pair) {
        setSelectedPair(pair);
      } else {
        setError(`Forex pair ${fromSymbol}/${toSymbol} not found`);
      }
    } catch (error) {
      console.error("Failed to fetch forex pair:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch forex pair data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Global Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Search Forex Pairs</h2>
          <p className="text-muted-foreground">
            Search for currency pai rs to view real-time exchange rates
          </p>
        </div>
        <ForexSearch onSelectPair={handleSelectPair} />
      </div>

      {/* Selected Pair Section */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading forex data...</div>
          </CardContent>
        </Card>
      )}

      {selectedPair && !isLoading && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Forex Pair Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ForexCard initialPair={selectedPair} />
              </div>
              <div className="lg:col-span-2">
                <ForexChart
                  fromSymbol={selectedPair.fromSymbol}
                  toSymbol={selectedPair.toSymbol}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Section */}
      <div>
        <ForexWatchlist />
      </div>
    </div>
  );
}
