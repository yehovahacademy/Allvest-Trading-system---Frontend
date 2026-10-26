import { useCallback, useEffect, useId, useState } from "react";
import { getStocks, getStockQuote, placeOrder } from "../Services/api";

/* -------------------------------------------------------------------------- */
/* Constants & utilities                                                      */
/* -------------------------------------------------------------------------- */

const ORDER_SIDES = ["BUY", "SELL"];

const styles = {
  panel: "rounded-2xl border border-slate-800 bg-slate-900/70 p-5",
  input:
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
  badge: "rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300",
  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
};

function formatPrice(price, currency = "USD") {
  if (price === null || price === undefined || price === "") return "Unavailable";

  const value = Number(price);
  if (!Number.isFinite(value)) return "Unavailable";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function formatTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
}

function parseQuantity(raw) {
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

/* -------------------------------------------------------------------------- */
/* Data hooks                                                                 */
/* -------------------------------------------------------------------------- */

function useStocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getStocks();
        if (!cancelled) setStocks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load stocks.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stocks, loading, error };
}

function useQuote(symbol) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuote(null);
    setError("");

    if (!symbol) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const data = await getStockQuote(symbol);
        if (!cancelled) setQuote(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to fetch the stock quote.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { quote, loading, error };
}

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                  */
/* -------------------------------------------------------------------------- */

const alertVariants = {
  error: {
    role: "alert",
    classes: "border-red-500/30 bg-red-500/10 text-red-300",
  },
  success: {
    role: "status",
    classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
};

function Alert({ variant, children }) {
  const { role, classes } = alertVariants[variant];

  return (
    <div role={role} className={`rounded-xl border p-4 text-sm ${classes}`}>
      {children}
    </div>
  );
}

function PageHeader({ title, description }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
      <p className="mt-2 max-w-2xl text-slate-400">{description}</p>
    </header>
  );
}

function PanelMessage({ children }) {
  return <p className="py-8 text-sm text-slate-400">{children}</p>;
}

/* -------------------------------------------------------------------------- */
/* Stocks table                                                               */
/* -------------------------------------------------------------------------- */

const TABLE_COLUMNS = ["Stock", "Sector", "Reference price", "Data status"];

function StocksTable({ stocks, selectedSymbol, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <caption className="sr-only">
          Supported stocks. Select a row to view its quote and place an order.
        </caption>

        <thead>
          <tr className="border-b border-slate-800 text-xs text-slate-500">
            {TABLE_COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-3 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {stocks.map((stock) => {
            const isSelected = stock.symbol === selectedSymbol;

            return (
              <tr
                key={stock.symbol}
                onClick={() => onSelect(stock.symbol)}
                className={`cursor-pointer border-b border-slate-800/70 transition-colors hover:bg-slate-800/60 ${
                  isSelected ? "bg-blue-500/10" : ""
                }`}
              >
                <td className="px-3 py-4">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(stock.symbol);
                    }}
                    aria-pressed={isSelected}
                    className={`rounded text-left ${styles.focusRing}`}
                  >
                    <span className="block font-semibold text-white">
                      {stock.symbol}
                    </span>
                    <span className="mt-1 block text-xs font-normal text-slate-400">
                      {stock.company_name}
                    </span>
                  </button>
                </td>

                <td className="px-3 py-4 text-slate-300">{stock.sector || "—"}</td>

                <td className="px-3 py-4 text-slate-200">
                  {formatPrice(stock.reference_price, stock.currency || "USD")}
                </td>

                <td className="px-3 py-4">
                  <span className={styles.badge}>{stock.data_status || "Unknown"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StocksPanel({ stocks, loading, error, selectedSymbol, onSelect }) {
  let content;

  if (loading) {
    content = <PanelMessage>Loading stocks…</PanelMessage>;
  } else if (error) {
    content = <Alert variant="error">{error}</Alert>;
  } else if (stocks.length === 0) {
    content = <PanelMessage>No stocks are currently available.</PanelMessage>;
  } else {
    content = (
      <StocksTable
        stocks={stocks}
        selectedSymbol={selectedSymbol}
        onSelect={onSelect}
      />
    );
  }

  return (
    <section className={`${styles.panel} lg:col-span-2`} aria-labelledby="stocks-heading">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="stocks-heading" className="text-lg font-semibold text-white">
            Supported stocks
          </h2>
          <p className="mt-1 text-sm text-slate-400">Market data provided by the backend</p>
        </div>

        <span className={styles.badge}>{stocks.length} stocks</span>
      </div>

      {content}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Quote panel                                                                */
/* -------------------------------------------------------------------------- */

function QuotePanel({ stock, quote, loading, error }) {
  const currency = quote?.currency || stock?.currency || "USD";
  const updatedAt = formatTimestamp(quote?.updated_at);

  let content;

  if (!stock) {
    content = <PanelMessage>Select a stock to view its quote.</PanelMessage>;
  } else if (loading) {
    content = <PanelMessage>Fetching quote…</PanelMessage>;
  } else if (error) {
    content = <Alert variant="error">{error}</Alert>;
  } else {
    content = (
      <dl className="space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-slate-400">Latest price</dt>
          <dd className="text-xl font-semibold text-white">
            {formatPrice(quote?.price, currency)}
          </dd>
        </div>

        {updatedAt && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-400">Updated</dt>
            <dd className="text-slate-300">{updatedAt}</dd>
          </div>
        )}
      </dl>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="quote-heading">
      <h2 id="quote-heading" className="text-lg font-semibold text-white">
        Stock quote
      </h2>

      {stock && (
        <div className="mb-5 mt-4 border-b border-slate-800 pb-5">
          <p className="text-2xl font-bold text-white">{stock.symbol}</p>
          <p className="mt-1 text-sm text-slate-400">{stock.company_name}</p>
        </div>
      )}

      {content}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Order form                                                                 */
/* -------------------------------------------------------------------------- */

function SideToggle({ value, onChange, disabled }) {
  return (
    <div
      role="radiogroup"
      aria-label="Order side"
      className="grid grid-cols-2 gap-1 rounded-lg border border-slate-700 bg-slate-950 p-1"
    >
      {ORDER_SIDES.map((side) => {
        const isActive = value === side;
        const activeColor =
          side === "BUY" ? "bg-emerald-500 text-white" : "bg-red-500 text-white";

        return (
          <button
            key={side}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(side)}
            className={`rounded-md py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
              styles.focusRing
            } ${isActive ? activeColor : "text-slate-400 hover:text-white"}`}
          >
            {side === "BUY" ? "Buy" : "Sell"}
          </button>
        );
      })}
    </div>
  );
}

function OrderPanel({ symbol, price, currency, onOrderPlaced }) {
  const quantityId = useId();

  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // A new selection starts a fresh order; clear stale feedback.
  useEffect(() => {
    setError("");
    setNotice("");
  }, [symbol]);

  const parsedQuantity = parseQuantity(quantity);
  const numericPrice = Number(price);
  const estimatedValue =
    parsedQuantity && Number.isFinite(numericPrice) && price !== null && price !== ""
      ? parsedQuantity * numericPrice
      : null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!symbol) {
      setError("Select a stock to trade.");
      return;
    }

    if (!parsedQuantity) {
      setError("Enter a positive whole-number quantity.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await placeOrder({ symbol, side, quantity: parsedQuantity });

      setNotice(
        `${result.side} order submitted for ${result.quantity} ${result.symbol}. Order ID: ${result.id}.`
      );
      setQuantity("1");
      onOrderPlaced?.(result);
    } catch (err) {
      setError(err.message || "Unable to place the order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="order-heading">
      <h2 id="order-heading" className="text-lg font-semibold text-white">
        Place order
      </h2>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <SideToggle value={side} onChange={setSide} disabled={submitting} />

        <div>
          <label htmlFor={quantityId} className="mb-1.5 block text-sm text-slate-300">
            Quantity
          </label>
          <input
            id={quantityId}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={submitting}
            className={styles.input}
          />
        </div>

        {estimatedValue !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Estimated value</span>
            <span className="font-medium text-white">
              {formatPrice(estimatedValue, currency)}
            </span>
          </div>
        )}

        {error && <Alert variant="error">{error}</Alert>}
        {notice && <Alert variant="success">{notice}</Alert>}

        <button
          type="submit"
          disabled={!symbol || submitting}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            styles.focusRing
          } ${side === "BUY" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}
        >
          {submitting
            ? "Submitting…"
            : `${side === "BUY" ? "Buy" : "Sell"}${symbol ? ` ${symbol}` : ""}`}
        </button>
      </form>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Markets() {
  const { stocks, loading: stocksLoading, error: stocksError } = useStocks();
  const [selectedSymbol, setSelectedSymbol] = useState("");

  // Default to the first stock once the list arrives.
  useEffect(() => {
    if (!selectedSymbol && stocks.length > 0) {
      setSelectedSymbol(stocks[0].symbol);
    }
  }, [stocks, selectedSymbol]);

  const { quote, loading: quoteLoading, error: quoteError } = useQuote(selectedSymbol);

  const selectedStock = stocks.find((stock) => stock.symbol === selectedSymbol) ?? null;
  const currency = quote?.currency || selectedStock?.currency || "USD";

  const handleSelect = useCallback((symbol) => setSelectedSymbol(symbol), []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Markets"
        description="Explore supported stocks, view quotes, and place buy or sell orders."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StocksPanel
          stocks={stocks}
          loading={stocksLoading}
          error={stocksError}
          selectedSymbol={selectedSymbol}
          onSelect={handleSelect}
        />

        <div className="space-y-6">
          <QuotePanel
            stock={selectedStock}
            quote={quote}
            loading={quoteLoading}
            error={quoteError}
          />

          <OrderPanel
            symbol={selectedSymbol}
            price={quote?.price}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}