"use client"

import { useState } from "react"
import { StockSearch } from "./stock-search"
import { StockCard } from "./stock-card"
import { StockChart } from "./stock-chart"
import { Watchlist } from "./watchlist"
import type { Stock } from "@/types/stock"
import { getStock } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiKeySetup } from "./api-key-setup"
import { useStock } from "@/contexts/stock-context"
import { AlertCircle } from "lucide-react"

export function StockDashboard() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { error, setError, clearError } = useStock()

  const handleSelectStock = async (symbol: string) => {
    setIsLoading(true)
    clearError()

    try {
      const stock = await getStock(symbol)
      if (stock) {
        setSelectedStock(stock)
      } else {
        setError(`Stock ${symbol} not found`)
      }
    } catch (error) {
      console.error("Failed to fetch stock:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch stock data")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <ApiKeySetup />

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
          <h2 className="text-2xl font-semibold mb-2">Search Stocks</h2>
          <p className="text-muted-foreground">Search for stocks by symbol or company name to view real-time data</p>
        </div>
        <StockSearch onSelectStock={handleSelectStock} />
      </div>

      {/* Selected Stock Section */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading stock data...</div>
          </CardContent>
        </Card>
      )}

      {selectedStock && !isLoading && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Stock Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <StockCard initialStock={selectedStock} />
              </div>
              <div className="lg:col-span-2">
                <StockChart symbol={selectedStock.symbol} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Section */}
      <div>
        <Watchlist />
      </div>
    </div>
  )
}
