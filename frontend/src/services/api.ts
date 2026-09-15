// src/services/api.ts
const BACKEND_URL = "http://localhost:8000";

export async function fetchSubscribersFromAPI() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/subscribers`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch subscribers:", e);
  }
  return null;
}

export async function sendSingleDispatch(
  subscriberId: string,
  imageBase64: string,
  linkZones: any[],
) {
  const res = await fetch(`${BACKEND_URL}/api/dispatch/single`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscriber_id: subscriberId,
      image_base64: imageBase64,
      link_zones: linkZones,
    }),
  });
  if (!res.ok) throw new Error("Dispatch failed");
  return await res.json();
}

export async function sendAllDispatch(imageBase64: string, linkZones: any[]) {
  const res = await fetch(`${BACKEND_URL}/api/dispatch/all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: imageBase64, link_zones: linkZones }),
  });
  if (!res.ok) throw new Error("Bulk dispatch failed");
  return await res.json();
}
