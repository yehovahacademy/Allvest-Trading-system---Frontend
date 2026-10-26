
import { useEffect, useState } from "react";
import { getStocks } from "../../Services/api";

export default function MarketOverview() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStocks()
      .then(setStocks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5">
        <p className="text-sm text-slate-400">Market</p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Market Overview
        </h2>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading market data...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : stocks.length === 0 ? (
        <p className="text-sm text-slate-400">
          No supported stocks are available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 pr-4 font-medium">Stock</th>
                <th className="pb-3 pr-4 font-medium">Sector</th>
                <th className="pb-3 text-right font-medium">
                  Reference price
                </th>
              </tr>
            </thead>

            <tbody>
              {stocks.slice(0, 6).map((stock) => (
                <tr
                  key={stock.symbol}
                  className="border-b border-slate-800/70 last:border-0"
                >
                  <td className="py-4 pr-4">
                    <p className="font-medium text-white">
                      {stock.symbol}
                    </p>
                    <p className="mt-1 max-w-40 truncate text-xs text-slate-400">
                      {stock.company_name}
                    </p>
                  </td>

                  <td className="py-4 pr-4 text-slate-300">
                    {stock.sector || "—"}
                  </td>

                  <td className="py-4 text-right text-white">
                    {stock.reference_price == null
                      ? "Unavailable"
                      : new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: stock.currency || "USD",
                          maximumFractionDigits: 2,
                        }).format(Number(stock.reference_price))}
                    <p className="mt-1 text-xs text-slate-500">
                      {stock.data_status || "Status unavailable"}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}s
