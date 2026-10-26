
import { useEffect, useState } from "react";
import { getOrders } from "../../Services/api";

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5">
        <p className="text-sm text-slate-400">Activity</p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Recent Orders
        </h2>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading orders...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-400">
          No orders yet. Your BUY and SELL orders will appear here.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                    order.side === "BUY"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {order.side}
                </span>

                <div>
                  <p className="font-medium text-white">{order.symbol}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Qty: {order.quantity}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-white">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  }).format(Number(order.price))}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {order.status} ·{" "}
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
