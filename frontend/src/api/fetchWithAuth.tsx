export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers || {}),
  };

  return fetch(input, {
    ...init,
    headers,
  });
}
