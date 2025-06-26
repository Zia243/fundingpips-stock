import { Suspense } from "react";
import { ForexDashboard } from "@/components/forex-dashboard";
import { StockErrorBoundary } from "@/components/stock-error-boundary";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          {/* <div className="flex items-center justify-between"> */}
          <div>
            <h1 className="text-3xl font-bold">FundingPips</h1>
            <p className="text-muted-foreground">
              Real-time Forex Trading Platform
            </p>
            {/* </div> */}
            {/* <div className="text-sm text-muted-foreground">Powered by Alpha Vantage FX API</div> */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading dashboard...</div>}>
          <StockErrorBoundary>
            <ForexDashboard />
          </StockErrorBoundary>
        </Suspense>
      </main>
    </div>
  );
}
