// Popular forex pairs for search suggestions
export const POPULAR_FOREX_PAIRS = [
  {
    symbol: "EUR/USD",
    fromSymbol: "EUR",
    toSymbol: "USD",
    name: "Euro to US Dollar",
  },
  {
    symbol: "GBP/USD",
    fromSymbol: "GBP",
    toSymbol: "USD",
    name: "British Pound to US Dollar",
  },
  {
    symbol: "USD/JPY",
    fromSymbol: "USD",
    toSymbol: "JPY",
    name: "US Dollar to Japanese Yen",
  },
  {
    symbol: "USD/CHF",
    fromSymbol: "USD",
    toSymbol: "CHF",
    name: "US Dollar to Swiss Franc",
  },
  {
    symbol: "AUD/USD",
    fromSymbol: "AUD",
    toSymbol: "USD",
    name: "Australian Dollar to US Dollar",
  },
  {
    symbol: "USD/CAD",
    fromSymbol: "USD",
    toSymbol: "CAD",
    name: "US Dollar to Canadian Dollar",
  },
  {
    symbol: "NZD/USD",
    fromSymbol: "NZD",
    toSymbol: "USD",
    name: "New Zealand Dollar to US Dollar",
  },
  {
    symbol: "EUR/GBP",
    fromSymbol: "EUR",
    toSymbol: "GBP",
    name: "Euro to British Pound",
  },
  {
    symbol: "EUR/JPY",
    fromSymbol: "EUR",
    toSymbol: "JPY",
    name: "Euro to Japanese Yen",
  },
  {
    symbol: "GBP/JPY",
    fromSymbol: "GBP",
    toSymbol: "JPY",
    name: "British Pound to Japanese Yen",
  },
  {
    symbol: "AUD/JPY",
    fromSymbol: "AUD",
    toSymbol: "JPY",
    name: "Australian Dollar to Japanese Yen",
  },
  {
    symbol: "EUR/CHF",
    fromSymbol: "EUR",
    toSymbol: "CHF",
    name: "Euro to Swiss Franc",
  },
];

export const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  NZD: "New Zealand Dollar",
  CNY: "Chinese Yuan",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  PLN: "Polish Zloty",
  CZK: "Czech Koruna",
  HUF: "Hungarian Forint",
  RUB: "Russian Ruble",
  TRY: "Turkish Lira",
  ZAR: "South African Rand",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
};

// Define the IntradayData type
type IntradayData = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

// Generate mock intraday data for fallback
export function generateMockIntradayData(
  fromSymbol: string,
  toSymbol: string,
  days = 1
): IntradayData[] {
  const data: IntradayData[] = [];
  const baseRate = getBaseRate(fromSymbol, toSymbol);
  const intervals = days * 24 * 12; // 5-minute intervals

  for (let i = intervals; i >= 0; i--) {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - i * 5);

    // Generate realistic forex movement (smaller than stock movements)
    const randomChange = (Math.random() - 0.5) * 0.002; // ±0.1% max change
    const open = baseRate * (1 + randomChange * (i / intervals));
    const volatility = 0.0005; // 0.05% volatility

    const high = open * (1 + Math.random() * volatility);
    const low = open * (1 - Math.random() * volatility);
    const close = low + Math.random() * (high - low);

    data.push({
      timestamp: timestamp.toISOString(),
      open: Number(open.toFixed(5)),
      high: Number(high.toFixed(5)),
      low: Number(low.toFixed(5)),
      close: Number(close.toFixed(5)),
    });
  }

  return data;
}

function getBaseRate(fromSymbol: string, toSymbol: string): number {
  // Mock base rates for common pairs
  const rates: Record<string, number> = {
    "EUR/USD": 1.085,
    "GBP/USD": 1.265,
    "USD/JPY": 149.5,
    "USD/CHF": 0.875,
    "AUD/USD": 0.655,
    "USD/CAD": 1.365,
    "NZD/USD": 0.615,
    "EUR/GBP": 0.858,
    "EUR/JPY": 162.25,
    "GBP/JPY": 189.15,
  };

  const pairKey = `${fromSymbol}/${toSymbol}`;
  return rates[pairKey] || 1.0;
}
