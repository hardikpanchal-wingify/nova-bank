// Same-origin by default so the UI and API share one server.
// Override with VITE_API_BASE_URL if the API is hosted elsewhere.
// Set VITE_USE_MOCK=true to skip the backend and use mock data.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
