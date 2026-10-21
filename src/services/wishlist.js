import { useAuth } from '@/composables/useAuth';

function getStorageKey() {
  const email = useAuth().profileData.value?.user?.email ?? 'anonymous';
  return `cultiva.wishlist.${email}`;
}

function readItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(getStorageKey()) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeItems(items) {
  localStorage.setItem(getStorageKey(), JSON.stringify(items));
}

export async function listWishlistItems({ productName = '' } = {}) {
  const items = readItems();
  const query = productName.trim().toLocaleLowerCase('pt-BR');
  const results = query
    ? items.filter((item) => String(item.product_name ?? '').toLocaleLowerCase('pt-BR').includes(query))
    : items;
  return { results, count: results.length };
}

export async function addProductToWishlist(product) {
  const items = readItems();
  const productId = typeof product === 'object' ? product.id : product;
  const productName = typeof product === 'object' ? product.name : '';
  const existing = items.find((item) => String(item.product_id) === String(productId));
  if (existing) return existing;

  const item = {
    id: `${Date.now()}-${String(productId)}`,
    product_id: String(productId),
    product_name: productName || `Produto ${productId}`,
  };
  items.push(item);
  writeItems(items);
  return item;
}

export async function removeProductFromWishlist(itemId) {
  writeItems(readItems().filter((item) => String(item.id) !== String(itemId)));
}
