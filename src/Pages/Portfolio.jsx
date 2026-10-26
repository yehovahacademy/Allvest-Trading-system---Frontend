import { useCallback, useEffect, useMemo, useState } from "react";
import { getPortfolio } from "../Services/api";

/* -------------------------------------------------------------------------- */
/* Constants & utilities                                                      */
/* -------------------------------------------------------------------------- */

const styles = {
  panel: "rounded-2xl border border-slate-800 bg-slate-900/70 p-5",
  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const quantityFormatter = new Intl.NumberFormat("en-US");

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatCurrency(value) {
  const number = toNumber(value);
  return number === null ? "—" : currencyFormatter.format(number);
}

function formatQuantity(value) {
  const number = toNumber(value);
  return number === null ? "—" : quantityFormatter.format(number);
}

function formatTimestamp(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

/** Adds a derived `costBasis` (quantity × average buy price) to each holding. */
function withCostBasis(holding) {
  const quantity = toNumber(holding.quantity);
  const averagePrice = toNumber(holding.average_buy_price);

  return {
    ...holding,
    costBasis:
      quantity !== null && averagePrice !== null ? quantity * averagePrice : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Data hook                                                                  */
/* -------------------------------------------------------------------------- */

function usePortfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setPortfolio(await getPortfolio());
    } catch (err) {
      setError(err.message || "Unable to load your portfolio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const holdings = useMemo(
    () => (portfolio?.holdings ?? []).map(withCostBasis),
    [portfolio]
  );

  const totalCostBasis = useMemo(
    () => holdings.reduce((total, holding) => total + (holding.costBasis ?? 0), 0),
    [holdings]
  );

  return {
    portfolio,
    holdings,
    holdingsCount: portfolio?.holdings_count ?? holdings.length,
    totalCostBasis,
    loading,
    error,
    reload: load,
  };
}

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                  */
/* -------------------------------------------------------------------------- */

function Alert({ children }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
    >
      {children}
    </div>
  );
}

function PageHeader({ title, description, loading, onRefresh }) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{description}</p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className={`rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 ${styles.focusRing}`}
      >
        {loading ? "Refreshing…" : "Refresh"}
      </button>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

function StatCard({ label, value, hint }) {
  return (
    <section className={styles.panel}>
      <h2 className="text-sm font-normal text-slate-400">{label}</h2>
      <p className="mt-3 text-3xl font-bold tabular-nums text-white">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </section>
  );
}

function PortfolioSummary({ holdingsCount, totalCostBasis }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
      <StatCard
        label="Holdings"
        value={quantityFormatter.format(holdingsCount)}
        hint="Distinct stocks in your portfolio"
      />
      <StatCard
        label="Total cost basis"
        value={formatCurrency(totalCostBasis)}
        hint="Quantity × average buy price, summed across holdings"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Holdings                                                                   */
/* -------------------------------------------------------------------------- */

const COLUMNS = [
  { key: "symbol", label: "Symbol", align: "left" },
  { key: "quantity", label: "Quantity", align: "right" },
  { key: "average_buy_price", label: "Average buy price", align: "right" },
  { key: "costBasis", label: "Cost basis", align: "right" },
  { key: "updated_at", label: "Last updated", align: "right" },
];

const alignClass = { left: "text-left", right: "text-right" };

function EmptyHoldings() {
  return (
    <div className="py-10 text-center">
      <h3 className="font-semibold text-white">No holdings yet</h3>
      <p className="mt-2 text-sm text-slate-400">
        Place an eligible buy order on the{" "}
        <a
          href="/markets"
          className={`rounded text-blue-400 underline-offset-2 hover:underline ${styles.focusRing}`}
        >
          Markets
        </a>{" "}
        page to start building your portfolio.
      </p>
    </div>
  );
}

function HoldingsTable({ holdings }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <caption className="sr-only">Your current holdings</caption>

        <thead>
          <tr className="border-b border-slate-800 text-xs text-slate-500">
            {COLUMNS.map(({ key, label, align }) => (
              <th
                key={key}
                scope="col"
                className={`px-4 py-3 font-medium ${alignClass[align]}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {holdings.map((holding) => (
            <tr
              key={holding.symbol}
              className="border-b border-slate-800/70 last:border-0"
            >
              <th scope="row" className="px-4 py-4 text-left font-semibold text-white">
                {holding.symbol}
              </th>
              <td className="px-4 py-4 text-right tabular-nums text-slate-300">
                {formatQuantity(holding.quantity)}
              </td>
              <td className="px-4 py-4 text-right tabular-nums text-slate-300">
                {formatCurrency(holding.average_buy_price)}
              </td>
              <td className="px-4 py-4 text-right font-medium tabular-nums text-white">
                {formatCurrency(holding.costBasis)}
              </td>
              <td className="px-4 py-4 text-right text-slate-400">
                {formatTimestamp(holding.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HoldingsPanel({ holdings }) {
  return (
    <section className={styles.panel} aria-labelledby="holdings-heading">
      <div className="mb-5">
        <h2 id="holdings-heading" className="text-lg font-semibold text-white">
          Your holdings
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Positions from your saved portfolio
        </p>
      </div>

      {holdings.length === 0 ? <EmptyHoldings /> : <HoldingsTable holdings={holdings} />}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Portfolio() {
  const { portfolio, holdings, holdingsCount, totalCostBasis, loading, error, reload } =
    usePortfolio();

  const isInitialLoad = loading && !portfolio;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="My portfolio"
        description="Review your holdings and their average buy prices."
        loading={loading}
        onRefresh={reload}
      />

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {isInitialLoad ? (
        <div className={styles.panel} aria-busy="true">
          <p className="text-sm text-slate-400">Loading portfolio…</p>
        </div>
      ) : (
        <>
          <PortfolioSummary
            holdingsCount={holdingsCount}
            totalCostBasis={totalCostBasis}
          />
          <HoldingsPanel holdings={holdings} />
        </>
      )}
    </div>
  );
}