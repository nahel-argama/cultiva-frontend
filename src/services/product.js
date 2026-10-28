import { apiRequest } from '@/services/api';

const PRODUCT_SOURCE_URL = (import.meta.env.VITE_EXTERNAL_PRODUCTS_HOST ?? 'http://localhost:8001').replace(/\/+$/, '');
const DEFAULT_PER_PAGE = 12;

function normalizeOffer(offer) {
  return {
    ...offer,
    name: offer.product_name ?? '',
    price: offer.unit_price ?? '0.00',
    available_quantity: Number(offer.available_quantity ?? Math.max(0, Number(offer.total_quantity ?? 0) - Number(offer.reserved_quantity ?? 0))),
    category_name: offer.category?.name ?? '',
    // Preserve expected dashboard card shape without discarding the Laravel fields.
    total_quantity: Number(offer.total_quantity ?? 0),
    reserved_quantity: Number(offer.reserved_quantity ?? 0),
  };
}

export async function listProducts({ search = '', page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
  const params = new URLSearchParams({ search: search.trim(), page: String(page), per_page: String(perPage) });
  const response = await apiRequest(`/offers?${params}`);
  return {
    results: response.data.map(normalizeOffer),
    count: response.meta.total,
    page: response.meta.current_page,
    perPage: response.meta.per_page,
    lastPage: response.meta.last_page,
  };
}

export async function createProduct(data) {
  const response = await apiRequest('/offers', {
    method: 'POST',
    body: JSON.stringify({
      source_product_id: String(data.source_product_id ?? data.external_id ?? ''),
      category_id: Number(data.category_id ?? data.category),
      unit_price: String(data.unit_price ?? data.price),
      total_quantity: Number(data.total_quantity),
      harvest_date: data.harvest_date,
      lifespan_days: Number(data.lifespan_days),
    }),
  });
  return normalizeOffer(response?.data ?? response);
}

export async function updateProduct(id, data) {
  const payload = {};
  if (data.category_id !== undefined) payload.category_id = Number(data.category_id);
  if (data.category !== undefined) payload.category_id = Number(data.category);
  if (data.unit_price !== undefined) payload.unit_price = String(data.unit_price);
  if (data.price !== undefined) payload.unit_price = String(data.price);
  if (data.total_quantity !== undefined) payload.total_quantity = Number(data.total_quantity);

  const response = await apiRequest(`/offers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeOffer(response?.data ?? response);
}

// Laravel preserves the offer and purchases; only unreserved stock is cleared.
export async function clearAvailableStock(id) {
  const response = await apiRequest(`/offers/${id}`);
  const offer = response?.data ?? response;
  return updateProduct(id, { total_quantity: Number(offer.reserved_quantity ?? 0) });
}

export async function getProductById(id) {
  const response = await apiRequest(`/offers/${id}`);
  return normalizeOffer(response?.data ?? response);
}

export async function searchProducts(query = '') {
  if (!query.trim()) return [];
  const params = new URLSearchParams({ query: query.trim() });
  const response = await fetch(`${PRODUCT_SOURCE_URL}/api/products/search?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const error = new Error('Não foi possível pesquisar no catálogo de produtos.');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getSuggestedProductPrice(productId, state = 'SP') {
  const today = new Date().toISOString().slice(0, 10);
  const params = new URLSearchParams({ from_date: '2020-01-01', to_date: today, state: String(state || 'SP').toLowerCase() });
  const response = await fetch(`${PRODUCT_SOURCE_URL}/api/products/${encodeURIComponent(productId)}/prices?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Preço sugerido não disponível.');
  return response.json();
}
