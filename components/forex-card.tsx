"use client"

import { useState, useEffect } from "react"
import { Star, TrendingUp, TrendingDown, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ForexPair } from "@/types/forex"
import { useForex } from "@/contexts/forex-context"
import { cn } from "@/lib/utils"
import { getForexPair } from "@/lib/api"
import { CURRENCY_NAMES } from "@/lib/forex-data"

interface ForexCardProps {
  initialPair: ForexPair
  onRemove?: () => void
  showRemoveOption?: boolean
}

export function ForexCard({ initialPair, onRemove, showRemoveOption = false }: ForexCardProps) {
  const [pair, setPair] = useState<ForexPair>(initialPair)
  const [isLoading, setIsLoading] = useState(false)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, updatePair, setError } = useForex()

  const inWatchlist = isInWatchlist(pair.fromSymbol, pair.toSymbol)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedPair = await getForexPair(pair.fromSymbol, pair.toSymbol)
        if (updatedPair) {
          setPair(updatedPair)
          updatePair(updatedPair)
        }
      } catch (error) {
        console.error("Failed to update forex pair:", error)
        setError(error instanceof Error ? error.message : "Failed to update forex pair")
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [pair.fromSymbol, pair.toSymbol, updatePair, setError])

  const handleWatchlistToggle = async () => {
    setIsLoading(true)
    try {
      if (inWatchlist) {
        removeFromWatchlist(pair.fromSymbol, pair.toSymbol)
      } else {
        addToWatchlist(pair.fromSymbol, pair.toSymbol)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update watchlist")
    } finally {
      setIsLoading(false)
    }
  }

  const isPositive = pair.change >= 0
  const fromCurrencyName = CURRENCY_NAMES[pair.fromSymbol] || pair.fromSymbol
  const toCurrencyName = CURRENCY_NAMES[pair.toSymbol] || pair.toSymbol

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div>
            <h3 className="font-semibold text-lg">{pair.symbol}</h3>
            <p className="text-sm text-muted-foreground">
              {fromCurrencyName} to {toCurrencyName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWatchlistToggle}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <Star
              className={cn("h-4 w-4", inWatchlist ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")}
            />
          </Button>
          {showRemoveOption && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  Remove from watchlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{pair.price.toFixed(5)}</div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={isPositive ? "default" : "destructive"}
                className={cn(
                  "flex items-center space-x-1",
                  isPositive ? "bg-green-100 text-green-800 hover:bg-green-100" : "",
                )}
              >
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>
                  {isPositive ? "+" : ""}
                  {pair.change.toFixed(5)} ({isPositive ? "+" : ""}
                  {pair.changePercent.toFixed(2)}%)
                </span>
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Bid</p>
              <p className="font-medium">{pair.bid.toFixed(5)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ask</p>
              <p className="font-medium">{pair.ask.toFixed(5)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">High</p>
              <p className="font-medium">{pair.high.toFixed(5)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Low</p>
              <p className="font-medium">{pair.low.toFixed(5)}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(pair.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
