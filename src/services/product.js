import { apiRequest } from '@/services/api';

const PRODUCT_SOURCE_URL = (import.meta.env.VITE_EXTERNAL_PRODUCTS_HOST ?? 'http://localhost:8000').replace(/\/+$/, '');
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

async function getOffersPage(page, perPage) {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const response = await apiRequest(`/offers?${params}`);
  return {
    results: (response?.data ?? []).map(normalizeOffer),
    count: Number(response?.meta?.total ?? response?.data?.length ?? 0),
    hasNext: Boolean(response?.links?.next),
  };
}

export async function listProducts({ query = '', page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
  if (!query.trim()) return getOffersPage(page, perPage);

  const allOffers = [];
  let currentPage = 1;
  let hasNext = true;
  let count = 0;
  while (hasNext) {
    const result = await getOffersPage(currentPage, 100);
    allOffers.push(...result.results);
    count = result.count || allOffers.length;
    hasNext = result.hasNext;
    currentPage++;
  }

  const term = query.trim().toLocaleLowerCase('pt-BR');
  const matches = allOffers.filter((offer) => String(offer.name).toLocaleLowerCase('pt-BR').includes(term));
  const start = (page - 1) * perPage;
  return { results: matches.slice(start, start + perPage), count: matches.length };
}

export async function createProduct(data) {
  const response = await apiRequest('/offers', {
    method: 'POST',
    body: JSON.stringify({
      source_product_id: String(data.source_product_id ?? data.external_id ?? ''),
      category_id: Number(data.category_id ?? data.category),
      unit_price: String(data.unit_price ?? data.price),
      total_quantity: Number(data.total_quantity),
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

// The current Laravel API has no DELETE offer route. Setting total quantity to
// the already-reserved quantity removes it from available stock without losing sales history.
export async function deleteProduct(id) {
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

export async function generateProductDescription() {
  const error = new Error('A API Laravel atual não disponibiliza geração de descrição por IA.');
  error.status = 503;
  throw error;
}
