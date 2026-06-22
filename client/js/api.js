import { API_BASE } from "./config.js";

export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Order API error:", data);
    throw new Error(data.message || "Failed to create order");
  }

  return data;
}