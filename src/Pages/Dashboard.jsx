
import PortfolioSummary from "../Components/dashboard/PortfolioSummary";
import MarketOverview from "../Components/dashboard/MarketOverview";
import RecentOrders from "../Components/dashboard/RecentOrders";

export default function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-400">
          TRADING WORKSPACE
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          Track your portfolio, explore supported stocks, and review your orders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PortfolioSummary />
        <MarketOverview />
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
