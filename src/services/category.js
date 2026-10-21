import { apiRequest } from '@/services/api';

export async function listCategories() {
  const response = await apiRequest('/products/categories');
  return response?.data ?? [];
}
