const isLocal =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

export const API_BASE = isLocal
  ? "http://localhost:5000"
  : "https://nelleyworld-api.onrender.com";