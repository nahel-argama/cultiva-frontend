import { apiRequest } from '@/services/api';

export async function listWishlistItems({ productName = '', page = 1, perPage = 12 } = {}) {
  const params = new URLSearchParams({ search: productName.trim(), page: String(page), per_page: String(perPage) });
  const response = await apiRequest(`/wishlist/items?${params}`);
  return {
    results: response.data,
    count: response.meta.total,
    page: response.meta.current_page,
    perPage: response.meta.per_page,
    lastPage: response.meta.last_page,
  };
}

export async function addProductToWishlist(product) {
  const response = await apiRequest('/wishlist/items', {
    method: 'POST',
    body: JSON.stringify({ product_id: String(typeof product === 'object' ? product.id : product) }),
  });
  return response.data;
}

export async function removeProductFromWishlist(itemId) {
  await apiRequest(`/wishlist/items/${itemId}`, { method: 'DELETE' });
}
