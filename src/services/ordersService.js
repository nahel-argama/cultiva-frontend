import { apiRequest } from '@/services/api';
import { useAuth } from '@/composables/useAuth';

export async function listOrders({ search = '', page = 1, perPage = 15 } = {}) {
  const profileType = String(useAuth().profileData.value?.profile_type ?? '').toLowerCase();
  if (!['producer', 'retailer'].includes(profileType)) {
    throw new Error('O histórico está disponível apenas para produtores e varejistas.');
  }

  const endpoint = profileType === 'producer' ? '/sales' : '/purchases';
  const params = new URLSearchParams({ search: search.trim(), page: String(page), per_page: String(perPage) });
  const response = await apiRequest(`${endpoint}?${params}`);
  return {
    results: response.data,
    count: response.meta.total,
    page: response.meta.current_page,
    perPage: response.meta.per_page,
    lastPage: response.meta.last_page,
  };
}
