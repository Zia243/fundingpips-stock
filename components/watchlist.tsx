"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertCircle } from "lucide-react"
import { useStock } from "@/contexts/stock-context"
import { StockCard } from "./stock-card"
import type { Stock } from "@/types/stock"
import { getMultipleStocks } from "@/lib/api"

export function Watchlist() {
  const { watchlist, removeFromWatchlist, error, setError, clearError } = useStock()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchWatchlistStocks = async () => {
    if (watchlist.length === 0) {
      setStocks([])
      return
    }

    setIsLoading(true)
    clearError()

    try {
      const watchlistStocks = await getMultipleStocks(watchlist)
      setStocks(watchlistStocks)
    } catch (error) {
      console.error("Failed to fetch watchlist stocks:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch watchlist stocks")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWatchlistStocks()
  }, [watchlist])

  const handleRemoveStock = (symbol: string) => {
    removeFromWatchlist(symbol)
  }

  if (watchlist.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Your watchlist is empty. Search for stocks to add them to your watchlist.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Watchlist ({watchlist.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchWatchlistStocks} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading watchlist...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {stocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                initialStock={stock}
                onRemove={() => handleRemoveStock(stock.symbol)}
                showRemoveOption={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
