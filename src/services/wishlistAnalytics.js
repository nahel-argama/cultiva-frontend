import { apiRequest } from '@/services/api';

export async function getWishlistAnalytics({ state = '', limit = 10 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (state) params.set('state', state);
  const response = await apiRequest(`/wishlist/analytics?${params}`);
  return response.data;
}
