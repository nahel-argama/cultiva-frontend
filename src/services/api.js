const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost')
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '');

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('cultiva.access_token');
  const headers = new Headers(options.headers);
  const normalizedPath = path.startsWith('/v1/') ? path : `/v1${path.startsWith('/') ? path : `/${path}`}`;

  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message ?? 'Não foi possível concluir a requisição.');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function login(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function signup(data) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
