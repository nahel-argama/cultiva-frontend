import { apiRequest } from '@/services/api';

const PAGE_SIZE = 100;

export async function listHarvestForecasts({ productId = '', dateFrom, dateTo, page = 1 } = {}) {
  const params = new URLSearchParams({ page: String(page), per_page: String(PAGE_SIZE) });
  if (productId) params.set('source_product_id', String(productId));
  if (dateFrom && dateTo) {
    params.set('date_from', dateFrom);
    params.set('date_to', dateTo);
  }

  const response = await apiRequest(`/harvest-forecasts?${params}`);
  return response;
}

export async function listAllHarvestForecasts(filters = {}) {
  const firstPage = await listHarvestForecasts({ ...filters, page: 1 });
  const forecasts = [...(firstPage.data ?? [])];
  const lastPage = Number(firstPage.meta?.last_page ?? 1);

  for (let page = 2; page <= lastPage; page++) {
    const response = await listHarvestForecasts({ ...filters, page });
    forecasts.push(...(response.data ?? []));
  }

  return forecasts;
}

export async function listHarvestSeasonPeriods(productId) {
  const params = new URLSearchParams({ source_product_id: String(productId) });
  const response = await apiRequest(`/harvest-season-periods?${params}`);
  return response.data ?? [];
}

export async function createHarvestForecast(data) {
  const response = await apiRequest('/harvest-forecasts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateHarvestForecast(id, data) {
  const response = await apiRequest(`/harvest-forecasts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.data;
}

export function deleteHarvestForecast(id) {
  return apiRequest(`/harvest-forecasts/${id}`, { method: 'DELETE' });
}
