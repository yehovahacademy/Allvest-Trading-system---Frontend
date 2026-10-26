
import { useEffect, useState } from "react";
import { getPortfolio, USER_ID } from "../../services/api";

function formatMoney(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PortfolioSummary() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPortfolio()
      .then(setPortfolio)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const holdings = portfolio?.holdings ?? [];

  const costBasis = holdings.reduce((total, holding) => {
    return (
      total +
      Number(holding.quantity) * Number(holding.average_buy_price)
    );
  }, 0);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Portfolio Summary</p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Your holdings
          </h2>
        </div>

        <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
          User #{USER_ID}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading portfolio...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-800/70 p-4">
              <p className="text-sm text-slate-400">Holdings</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {portfolio.holdings_count}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800/70 p-4">
              <p className="text-sm text-slate-400">Total cost basis</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatMoney(costBasis)}
              </p>
            </div>
          </div>

          {holdings.length === 0 ? (
            <p className="mt-5 text-sm text-slate-400">
              You don't have any holdings yet. Place a BUY order to get started.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {holdings.slice(0, 4).map((holding) => (
                <div
                  key={holding.symbol}
                  className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-white">
                      {holding.symbol}
                    </p>
                    <p className="text-xs text-slate-400">
                      Quantity: {holding.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-white">
                      {formatMoney(Number(holding.average_buy_price))}
                    </p>
                    <p className="text-xs text-slate-400">
                      Average buy price
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
