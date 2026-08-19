const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:5000/api/v1";
const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000/api/v1";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("health_auth_token");
}

export function getUserRole(): "user" | "doctor" | "admin" | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("health_auth_role") as any;
}

export function setAuth(token: string, role: "user" | "doctor" | "admin", userData?: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("health_auth_token", token);
  localStorage.setItem("health_auth_role", role);
  if (userData) {
    localStorage.setItem("health_auth_user", JSON.stringify(userData));
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("health_auth_token");
  localStorage.removeItem("health_auth_role");
  localStorage.removeItem("health_auth_user");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("health_auth_user");
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}, isPython: boolean = false) {
  const token = getToken();
  const baseUrl = isPython ? PYTHON_API_URL : NODE_API_URL;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.detail || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}
