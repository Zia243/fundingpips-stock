import type { Stock, HistoricalData, SearchResult } from "@/types/stock"

// Mock stock data
export const MOCK_STOCKS: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 195.89,
    change: 2.34,
    changePercent: 1.21,
    volume: 45678900,
    marketCap: 3020000000000,
    high52Week: 199.62,
    low52Week: 164.08,
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.56,
    change: -1.23,
    changePercent: -0.85,
    volume: 23456789,
    marketCap: 1800000000000,
    high52Week: 153.78,
    low52Week: 121.46,
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.85,
    change: 4.67,
    changePercent: 1.25,
    volume: 34567890,
    marketCap: 2810000000000,
    high52Week: 384.3,
    low52Week: 309.45,
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 248.42,
    change: -8.91,
    changePercent: -3.46,
    volume: 67890123,
    marketCap: 790000000000,
    high52Week: 299.29,
    low52Week: 138.8,
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 155.89,
    change: 1.78,
    changePercent: 1.15,
    volume: 45123678,
    marketCap: 1620000000000,
    high52Week: 170.0,
    low52Week: 118.35,
    lastUpdated: new Date().toISOString(),
  },
]

export const SEARCH_RESULTS: SearchResult[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
  // Add more search results...
]

// Generate mock historical data
export function generateHistoricalData(symbol: string, days = 30): HistoricalData[] {
  const data: HistoricalData[] = []
  const basePrice = MOCK_STOCKS.find((s) => s.symbol === symbol)?.price || 100

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Generate realistic price movement
    const randomChange = (Math.random() - 0.5) * 0.1 // ±5% max change
    const price = basePrice * (1 + randomChange * (i / days))
    const volume = Math.floor(Math.random() * 50000000) + 10000000

    data.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
      volume,
    })
  }

  return data
}
