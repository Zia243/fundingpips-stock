import type {
  Stock,
  SearchResult,
  HistoricalData,
  ForexPair,
  ForexSearchResult,
  IntradayData,
} from "@/types/stock";
import { POPULAR_FOREX_PAIRS, generateMockIntradayData } from "./forex-data";

const BASE_URL = "https://www.alphavantage.co/query";

// Cache to avoid hitting rate limits
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes cache for forex data

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchFromAlphaVantage(params: Record<string, string>) {
  const url = new URL(BASE_URL);
  url.searchParams.append("apikey", "demo");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const cacheKey = url.toString();
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check for API error responses
    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
    }

    if (data["Note"]) {
      throw new Error("API rate limit exceeded. Please try again later.");
    }

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Alpha Vantage API error:", error);
    throw error;
  }
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const data = await fetchFromAlphaVantage({
      function: "SYMBOL_SEARCH",
      keywords: query,
    });

    const matches = data["bestMatches"] || [];

    return matches.slice(0, 10).map((match: any) => ({
      symbol: match["1. symbol"],
      name: match["2. name"],
      type: match["3. type"],
      region: match["4. region"],
      marketOpen: match["5. marketOpen"],
      marketClose: match["6. marketClose"],
      timezone: match["7. timezone"],
      currency: match["8. currency"],
    }));
  } catch (error) {
    console.error("Search failed:", error);
    // Return fallback mock data if API fails
    return [
      {
        symbol: query.toUpperCase(),
        name: `${query.toUpperCase()} Company`,
        type: "Equity",
        region: "United States",
        marketOpen: "09:30",
        marketClose: "16:00",
        timezone: "UTC-4",
        currency: "USD",
      },
    ];
  }
}

export async function getStock(symbol: string): Promise<Stock | null> {
  try {
    const data = await fetchFromAlphaVantage({
      function: "GLOBAL_QUOTE",
      symbol: symbol,
    });

    const quote = data["Global Quote"];
    if (!quote) return null;

    return {
      symbol: quote["01. symbol"],
      name: quote["01. symbol"], // Alpha Vantage doesn't provide company name in quote
      price: Number.parseFloat(quote["05. price"]),
      change: Number.parseFloat(quote["09. change"]),
      changePercent: Number.parseFloat(
        quote["10. change percent"].replace("%", "")
      ),
      volume: Number.parseInt(quote["06. volume"]),
      marketCap: 0, // Not available in basic quote
      high52Week: Number.parseFloat(quote["03. high"]),
      low52Week: Number.parseFloat(quote["04. low"]),
      lastUpdated: quote["07. latest trading day"],
    };
  } catch (error) {
    console.error("Failed to fetch stock:", error);
    return null;
  }
}

export async function getHistoricalData(
  symbol: string,
  period = "1M"
): Promise<HistoricalData[]> {
  try {
    const functionName =
      period === "1W" || period === "1M"
        ? "TIME_SERIES_DAILY"
        : "TIME_SERIES_WEEKLY";

    const data = await fetchFromAlphaVantage({
      function: functionName,
      symbol: symbol,
      outputsize: "compact",
    });

    const timeSeriesKey =
      functionName === "TIME_SERIES_DAILY"
        ? "Time Series (Daily)"
        : "Weekly Time Series";

    const timeSeries = data[timeSeriesKey];
    if (!timeSeries) return [];

    const entries = Object.entries(timeSeries);
    const days =
      period === "1W" ? 7 : period === "1M" ? 30 : period === "3M" ? 90 : 365;

    return entries
      .slice(0, days)
      .map(([date, values]: [string, any]) => ({
        date,
        price: Number.parseFloat(values["4. close"]),
        volume: Number.parseInt(values["5. volume"]),
      }))
      .reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error("Failed to fetch historical data:", error);
    // Return fallback data
    return generateFallbackHistoricalData(symbol, period);
  }
}

export async function getMultipleStocks(symbols: string[]): Promise<Stock[]> {
  // Alpha Vantage doesn't have batch quotes, so we'll fetch individually
  // In production, you might want to implement a queue to respect rate limits
  const promises = symbols.map((symbol) => getStock(symbol));
  const results = await Promise.allSettled(promises);

  return results
    .filter(
      (result): result is PromiseFulfilledResult<Stock> =>
        result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value);
}

// Fallback function for when API fails
function generateFallbackHistoricalData(
  symbol: string,
  period: string
): HistoricalData[] {
  const data: HistoricalData[] = [];
  const days =
    period === "1W" ? 7 : period === "1M" ? 30 : period === "3M" ? 90 : 365;
  const basePrice = 100 + Math.random() * 200;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const randomChange = (Math.random() - 0.5) * 0.1;
    const price = basePrice * (1 + randomChange * (i / days));
    const volume = Math.floor(Math.random() * 50000000) + 10000000;

    data.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
      volume,
    });
  }

  return data;
}

export async function searchForexPairs(
  query: string
): Promise<ForexSearchResult[]> {
  if (!query.trim()) return [];

  // Search through popular pairs
  const filtered = POPULAR_FOREX_PAIRS.filter(
    (pair) =>
      pair.symbol.toLowerCase().includes(query.toLowerCase()) ||
      pair.name.toLowerCase().includes(query.toLowerCase()) ||
      pair.fromSymbol.toLowerCase().includes(query.toLowerCase()) ||
      pair.toSymbol.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.slice(0, 10).map((pair) => ({
    symbol: pair.symbol,
    name: pair.name,
    fromSymbol: pair.fromSymbol,
    toSymbol: pair.toSymbol,
    type: "Currency Pair",
  }));
}

export async function getForexPair(
  fromSymbol: string,
  toSymbol: string
): Promise<ForexPair | null> {
  try {
    const data = await fetchFromAlphaVantage({
      function: "CURRENCY_EXCHANGE_RATE",
      from_currency: fromSymbol,
      to_currency: toSymbol,
    });

    const exchangeRate = data["Realtime Currency Exchange Rate"];
    if (!exchangeRate) {
      // Fallback to mock data if API doesn't return data
      return generateMockForexPair(fromSymbol, toSymbol);
    }

    const price = Number.parseFloat(exchangeRate["5. Exchange Rate"]);
    const previousClose = price * (1 + (Math.random() - 0.5) * 0.01); // Mock previous close
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: `${fromSymbol}/${toSymbol}`,
      fromSymbol,
      toSymbol,
      price,
      change,
      changePercent,
      bid: price * 0.9999, // Mock bid/ask spread
      ask: price * 1.0001,
      high: price * 1.002,
      low: price * 0.998,
      lastUpdated: exchangeRate["6. Last Refreshed"],
    };
  } catch (error) {
    console.error("Failed to fetch forex pair:", error);
    return generateMockForexPair(fromSymbol, toSymbol);
  }
}

export async function getIntradayData(
  fromSymbol: string,
  toSymbol: string,
  interval = "5min"
): Promise<IntradayData[]> {
  try {
    const data = await fetchFromAlphaVantage({
      function: "FX_INTRADAY",
      from_symbol: fromSymbol,
      to_symbol: toSymbol,
      interval: interval,
      outputsize: "compact",
    });

    const timeSeriesKey = `Time Series FX (${interval})`;
    const timeSeries = data[timeSeriesKey];

    if (!timeSeries) {
      // Fallback to mock data
      return generateMockIntradayData(fromSymbol, toSymbol);
    }

    const entries = Object.entries(timeSeries);

    return entries
      .slice(0, 100) // Limit to last 100 data points
      .map(([timestamp, values]: [string, any]) => ({
        timestamp,
        open: Number.parseFloat(values["1. open"]),
        high: Number.parseFloat(values["2. high"]),
        low: Number.parseFloat(values["3. low"]),
        close: Number.parseFloat(values["4. close"]),
      }))
      .reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error("Failed to fetch intraday data:", error);
    return generateMockIntradayData(fromSymbol, toSymbol);
  }
}

export async function getMultipleForexPairs(
  pairs: Array<{ from: string; to: string }>
): Promise<ForexPair[]> {
  const promises = pairs.map(({ from, to }) => getForexPair(from, to));
  const results = await Promise.allSettled(promises);

  return results
    .filter(
      (result): result is PromiseFulfilledResult<ForexPair> =>
        result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value);
}

// Helper function to generate mock forex pair data
function generateMockForexPair(
  fromSymbol: string,
  toSymbol: string
): ForexPair {
  const baseRates: Record<string, number> = {
    "EUR/USD": 1.085,
    "GBP/USD": 1.265,
    "USD/JPY": 149.5,
    "USD/CHF": 0.875,
    "AUD/USD": 0.655,
    "USD/CAD": 1.365,
  };

  const pairKey = `${fromSymbol}/${toSymbol}`;
  const basePrice = baseRates[pairKey] || 1.0;

  // Add some random movement
  const randomChange = (Math.random() - 0.5) * 0.01; // ±0.5% change
  const price = basePrice * (1 + randomChange);
  const change = price - basePrice;
  const changePercent = (change / basePrice) * 100;

  return {
    symbol: pairKey,
    fromSymbol,
    toSymbol,
    price: Number(price.toFixed(5)),
    change: Number(change.toFixed(5)),
    changePercent: Number(changePercent.toFixed(2)),
    bid: Number((price * 0.9999).toFixed(5)),
    ask: Number((price * 1.0001).toFixed(5)),
    high: Number((price * 1.002).toFixed(5)),
    low: Number((price * 0.998).toFixed(5)),
    lastUpdated: new Date().toISOString(),
  };
}
