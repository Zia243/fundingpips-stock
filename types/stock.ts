export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  high52Week: number
  low52Week: number
  lastUpdated: string
}

export interface HistoricalData {
  date: string
  price: number
  volume: number
}

export interface SearchResult {
  symbol: string
  name: string
  type: string
  region: string
  marketOpen: string
  marketClose: string
  timezone: string
  currency: string
}

// Forex types
export interface ForexPair {
  symbol: string // e.g., "EUR/USD"
  fromSymbol: string // e.g., "EUR"
  toSymbol: string // e.g., "USD"
  price: number
  change: number
  changePercent: number
  bid: number
  ask: number
  high: number
  low: number
  volume?: number
  lastUpdated: string
}

export interface IntradayData {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
}

export interface ForexSearchResult {
  symbol: string
  name: string
  fromSymbol: string
  toSymbol: string
  type: string
}

export interface ForexQuote {
  symbol: string
  price: number
  bid: number
  ask: number
  change: number
  changePercent: number
  lastUpdated: string
}
