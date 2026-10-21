import { capitalize } from '@/utils/string';
import { searchProducts } from '@/services/product';

export const productSearchService = {
  async search(query = '') {
    const products = await searchProducts(query);
    return Array.isArray(products)
      ? products.map((item) => ({ ...item, name: item.name ? capitalize(item.name) : '' }))
      : products;
  },
};
