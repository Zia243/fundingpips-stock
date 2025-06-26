"use client"

import { useState, useEffect } from "react"
import { Star, TrendingUp, TrendingDown, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Stock } from "@/types/stock"
import { useStock } from "@/contexts/stock-context"
import { formatCurrency, formatVolume, cn } from "@/lib/utils"
import { getStock } from "@/lib/api"

interface StockCardProps {
  initialStock: Stock
  onRemove?: () => void
  showRemoveOption?: boolean
}

export function StockCard({ initialStock, onRemove, showRemoveOption = false }: StockCardProps) {
  const [stock, setStock] = useState<Stock>(initialStock)
  const [isLoading, setIsLoading] = useState(false)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, updateStock, setError } = useStock()

  const inWatchlist = isInWatchlist(stock.symbol)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedStock = await getStock(stock.symbol)
        if (updatedStock) {
          setStock(updatedStock)
          updateStock(updatedStock)
        }
      } catch (error) {
        console.error("Failed to update stock:", error)
        setError(error instanceof Error ? error.message : "Failed to update stock")
      }
    }, 30000) // Update every 30 seconds to conserve API calls

    return () => clearInterval(interval)
  }, [stock.symbol, updateStock, setError])

  const handleWatchlistToggle = async () => {
    setIsLoading(true)
    try {
      if (inWatchlist) {
        removeFromWatchlist(stock.symbol)
      } else {
        addToWatchlist(stock.symbol)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update watchlist")
    } finally {
      setIsLoading(false)
    }
  }

  const isPositive = stock.change >= 0

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div>
            <h3 className="font-semibold text-lg">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{stock.name}</p>
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
            <div className="text-2xl font-bold">{formatCurrency(stock.price)}</div>
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
                  {formatCurrency(stock.change)} ({isPositive ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%)
                </span>
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Volume</p>
              <p className="font-medium">{formatVolume(stock.volume)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-medium">{stock.marketCap ? formatVolume(stock.marketCap) : "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">52W High</p>
              <p className="font-medium">{formatCurrency(stock.high52Week)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">52W Low</p>
              <p className="font-medium">{formatCurrency(stock.low52Week)}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(stock.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
