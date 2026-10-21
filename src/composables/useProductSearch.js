import { ref } from 'vue';
import { productSearchService } from '@/services/productSearch';

export function useProductSearch() {
  const options = ref([]);
  const isLoading = ref(false);
  let requestSequence = 0;

  async function search(query = '') {
    const requestId = ++requestSequence;
    isLoading.value = true;
    try {
      const results = await productSearchService.search(query);
      if (requestId === requestSequence) options.value = Array.isArray(results) ? results : [];
    } catch {
      if (requestId === requestSequence) options.value = [];
    } finally {
      if (requestId === requestSequence) isLoading.value = false;
    }
  }

  function reset() {
    requestSequence++;
    options.value = [];
    isLoading.value = false;
  }

  return { options, isLoading, search, reset };
}
