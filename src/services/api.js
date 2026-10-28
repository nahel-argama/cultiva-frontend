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
    if (response.status === 401 && !normalizedPath.startsWith('/v1/auth/') && !normalizedPath.startsWith('/v1/consult/')) {
      for (const key of ['access_token', 'refresh_token', 'user', 'auth_data']) {
        localStorage.removeItem(`cultiva.${key}`);
      }
      if (typeof window !== 'undefined') {
        const redirect = window.location.pathname + window.location.search;
        window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      }
    }
    const validationMessage = Object.values(payload?.errors ?? {}).flat().join(' ');
    const error = new Error(validationMessage || payload?.message || 'Não foi possível concluir a requisição.');
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
