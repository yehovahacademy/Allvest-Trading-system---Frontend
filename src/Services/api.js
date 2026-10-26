
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://allvest-trading-system-backend.onrender.com"
).replace(/\/+$/, "");

export const USER_ID = Number(import.meta.env.VITE_USER_ID || 3);

async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the trading API. Please try again."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data;
}

export function getStocks() {
  return request("/stocks");
}

export function getStockQuote(symbol) {
  return request(
    `/stocks/${encodeURIComponent(symbol)}/quote`
  );
}

export function getPortfolio(userId = USER_ID) {
  return request(`/portfolio/${userId}`);
}

export function getOrders(userId = USER_ID) {
  return request(`/orders/${userId}`);
}

export function placeOrder({ symbol, side, quantity }) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify({
      user_id: USER_ID,
      symbol: symbol.trim().toUpperCase(),
      side,
      quantity: Number(quantity),
    }),
  });
}
