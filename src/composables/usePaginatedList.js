import { ref } from 'vue';

export function usePaginatedList(fetchPage, perPage) {
  const items = ref([]);
  const totalItems = ref(0);
  const currentPage = ref(1);
  const itemsPerPage = ref(perPage);
  const isLoading = ref(false);
  const error = ref('');
  let requestSequence = 0;

  async function load(page = currentPage.value) {
    const requestId = ++requestSequence;
    currentPage.value = page;
    isLoading.value = true;
    error.value = '';
    try {
      const data = await fetchPage({ page, perPage: itemsPerPage.value });
      if (requestId !== requestSequence) return;
      if (data.page > data.lastPage) return load(data.lastPage);
      items.value = data.results;
      totalItems.value = data.count;
      currentPage.value = data.page;
      itemsPerPage.value = data.perPage;
    } catch (cause) {
      if (requestId !== requestSequence) return;
      items.value = [];
      totalItems.value = 0;
      currentPage.value = 1;
      error.value = cause?.message || 'Não foi possível carregar os dados.';
    } finally {
      if (requestId === requestSequence) isLoading.value = false;
    }
  }

  return { items, totalItems, currentPage, itemsPerPage, isLoading, error, load };
}
