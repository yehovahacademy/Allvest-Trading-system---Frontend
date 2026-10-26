
import { supabase } from "../lib/supabaseClient";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://allvest-trading-system-backend.onrender.com"
).replace(/\/+$/, "");

async function request(endpoint, options = {}) {
  let response;

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session retrieval failed:", sessionError.message);
      throw new Error("Unable to retrieve your login session.");
    }

    // Temporary authentication diagnostics — never log the token itself.
    console.log("========== API AUTH DIAGNOSTICS ==========");
    console.log("Endpoint:", endpoint);
    console.log("API base URL:", API_BASE_URL);
    console.log("Supabase session exists:", !!session);
    console.log("Access token exists:", !!session?.access_token);
    console.log("User ID exists:", !!session?.user?.id);
    console.log("==========================================");

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    console.log(
      "Authorization header attached:",
      headers.Authorization?.startsWith("Bearer ") === true
    );

    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log("API response status:", response.status);
    console.log("API request successful:", response.ok);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Unable to retrieve your login session."
    ) {
      throw error;
    }

    console.error("API request/network error:", error.message);
    throw new Error(
      "Unable to connect to the trading API. Please try again."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;

    console.error("API error response:", detail ?? response.status);

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

export function getPortfolio() {
  return request("/portfolio");
}

export function getOrders() {
  return request("/orders");
}

export function placeOrder({ symbol, side, quantity }) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify({
      symbol: symbol.trim().toUpperCase(),
      side,
      quantity: Number(quantity),
    }),
  });
}
