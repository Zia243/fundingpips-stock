"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertCircle } from "lucide-react"
import { useForex } from "@/contexts/forex-context"
import { ForexCard } from "./forex-card"
import type { ForexPair } from "@/types/forex"
import { getMultipleForexPairs } from "@/lib/api"

export function ForexWatchlist() {
  const { watchlist, removeFromWatchlist, error, setError, clearError } = useForex()
  const [pairs, setPairs] = useState<ForexPair[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchWatchlistPairs = async () => {
    if (watchlist.length === 0) {
      setPairs([])
      return
    }

    setIsLoading(true)
    clearError()

    try {
      const watchlistPairs = await getMultipleForexPairs(watchlist)
      setPairs(watchlistPairs)
    } catch (error) {
      console.error("Failed to fetch watchlist pairs:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch watchlist pairs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWatchlistPairs()
  }, [watchlist])

  const handleRemovePair = (fromSymbol: string, toSymbol: string) => {
    removeFromWatchlist(fromSymbol, toSymbol)
  }

  if (watchlist.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Forex Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Your watchlist is empty. Search for forex pairs to add them to your watchlist.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Popular pairs to try:</p>
              <p className="mt-2 font-mono">EUR/USD • GBP/USD • USD/JPY • AUD/USD</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Forex Watchlist ({watchlist.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchWatchlistPairs} disabled={isLoading}>
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
            {pairs.map((pair) => (
              <ForexCard
                key={pair.symbol}
                initialPair={pair}
                onRemove={() => handleRemovePair(pair.fromSymbol, pair.toSymbol)}
                showRemoveOption={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
