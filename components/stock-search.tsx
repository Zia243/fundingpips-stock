"use client"

import { useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { searchStocks } from "@/lib/api"
import { useSearch } from "@/contexts/search-context"
import { debounce } from "@/lib/utils"

interface StockSearchProps {
  onSelectStock: (symbol: string) => void
}

export function StockSearch({ onSelectStock }: StockSearchProps) {
  const { query, results, isLoading, isOpen, error, setQuery, setResults, setLoading, setOpen, setError, clearSearch } =
    useSearch()

  const searchRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchResults = await searchStocks(searchQuery)
      setResults(searchResults)
      setOpen(true)
    } catch (error) {
      console.error("Search failed:", error)
      setError(error instanceof Error ? error.message : "Search failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, 300)

  useEffect(() => {
    debouncedSearch(query)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setOpen])

  const handleSelectStock = (symbol: string) => {
    onSelectStock(symbol)
    clearSearch()
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (value && !isOpen) {
      setOpen(true)
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search stocks by symbol or name..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-10 pr-10"
          onFocus={() => query && setOpen(true)}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full z-50 mt-1 w-full border shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-destructive">{error}</div>
          ) : results.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSelectStock(result.symbol)}
                  className="w-full border-b border-border p-3 text-left transition-colors hover:bg-muted last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{result.symbol}</div>
                      <div className="text-sm text-muted-foreground">{result.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{result.type}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
          ) : null}
        </Card>
      )}
    </div>
  )
}
