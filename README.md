# FundingPips Stock Tracker

A real-time stock tracking application built with Next.js 15, featuring live stock data from Alpha Vantage API.

## Features

- 🔍 **Stock Search**: Search for stocks by symbol or company name
- 📈 **Real-time Data**: Live stock prices and market data
- 📊 **Historical Charts**: Interactive price charts with multiple timeframes
- ⭐ **Watchlist**: Personal watchlist with persistent storage
- 📱 **Responsive Design**: Mobile-first responsive interface

## Tech Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Source**: Alpha Vantage API
- **Charts**: Custom SVG implementation

## Getting Started

### Prerequisites

1. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Node.js 18+ installed

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

This application uses the Alpha Vantage API for real stock market data:

- **Symbol Search**: `SYMBOL_SEARCH` function for stock lookup
- **Real-time Quotes**: `GLOBAL_QUOTE` function for current prices
- **Historical Data**: `TIME_SERIES_DAILY` and `TIME_SERIES_WEEKLY` for charts

### Rate Limiting

- Free tier: 25 requests per day
- Premium tiers available for higher limits
- Built-in caching to minimize API calls
- Graceful fallbacks when limits are exceeded

## Architecture

### Server vs Client Components

- **Server Components**: Static content, initial page structure
- **Client Components**: Interactive features (search, watchlist, real-time updates)

### State Management

- **Zustand Store**: Watchlist persistence and stock data caching
- **Local Storage**: Watchlist persistence across sessions

### Error Handling

- API failure fallbacks
- Rate limit handling
- Network error recovery
- User-friendly error messages

## Performance Optimizations

- **Debounced Search**: Reduces API calls during typing
- **Data Caching**: 1-minute cache for API responses
- **Optimistic Updates**: Immediate UI feedback
- **Lazy Loading**: Components loaded on demand

## Deployment

The application is ready for deployment on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
\`\`\`

Let's also add a configuration component to help users set up their API key:
