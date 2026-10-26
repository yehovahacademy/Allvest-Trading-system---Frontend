import { useCallback, useEffect, useState } from "react";
import { getOrders } from "../services/api";

const panelClass =
  "rounded-2xl border border-slate-800 bg-slate-900/70 p-5";

function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4,
  }).format(price);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "UNKNOWN").toUpperCase();

  const styles =
    normalizedStatus === "FILLED" || normalizedStatus === "COMPLETED"
      ? "bg-emerald-500/10 text-emerald-400"
      : normalizedStatus === "REJECTED" || normalizedStatus === "FAILED"
        ? "bg-red-500/10 text-red-400"
        : "bg-slate-800 text-slate-300";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {normalizedStatus}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const buyOrders = orders.filter(
    (order) => String(order.side).toUpperCase() === "BUY"
  ).length;

  const sellOrders = orders.filter(
    (order) => String(order.side).toUpperCase() === "SELL"
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-400">
            TRADING WORKSPACE
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Order History
          </h1>

          <p className="mt-2 text-slate-400">
            Review the buy and sell orders returned by your backend.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <section className={panelClass}>
          <p className="text-sm text-slate-400">Total Orders</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {orders.length}
          </p>
        </section>

        <section className={panelClass}>
          <p className="text-sm text-slate-400">Buy Orders</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {buyOrders}
          </p>
        </section>

        <section className={panelClass}>
          <p className="text-sm text-slate-400">Sell Orders</p>
          <p className="mt-3 text-3xl font-bold text-rose-400">
            {sellOrders}
          </p>
        </section>
      </div>

      <section className={panelClass}>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            All Orders
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Order records retrieved from your account's current backend user ID.
          </p>
        </div>

        {loading ? (
          <p className="py-8 text-sm text-slate-400">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center">
            <h3 className="font-semibold text-white">
              No orders found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Orders you place from the Markets page will appear here when saved successfully.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Side</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Execution Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const isBuy =
                    String(order.side).toUpperCase() === "BUY";

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-slate-800/70 last:border-0"
                    >
                      <td className="px-4 py-4 text-slate-400">
                        #{order.id}
                      </td>

                      <td className="px-4 py-4 font-semibold text-white">
                        {order.symbol}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            isBuy
                              ? "font-medium text-emerald-400"
                              : "font-medium text-rose-400"
                          }
                        >
                          {String(order.side || "—").toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        {order.quantity ?? "—"}
                      </td>

                      <td className="px-4 py-4 text-slate-200">
                        {formatPrice(order.price)}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="px-4 py-4 text-slate-400">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
