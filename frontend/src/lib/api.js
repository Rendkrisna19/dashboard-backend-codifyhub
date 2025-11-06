export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (res.status === 401 || res.status === 403) {
    // token invalid/expired -> paksa logout
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }
  return res.json();
}
