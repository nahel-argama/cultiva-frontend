import { reactive } from 'vue';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/composables/useAuth';

const state = reactive({ carts: {} });

function userKey() {
  return useAuth().profileData.value?.user?.email ?? 'anonymous';
}

function loadCart() {
  const key = userKey();
  if (!state.carts[key]) {
    try {
      const stored = JSON.parse(localStorage.getItem(`cultiva.cart.${key}`) ?? '[]');
      state.carts[key] = Array.isArray(stored) ? stored : [];
    } catch {
      state.carts[key] = [];
    }
  }
  return state.carts[key];
}

function saveCart() {
  const key = userKey();
  localStorage.setItem(`cultiva.cart.${key}`, JSON.stringify(loadCart()));
}

export function useCartStore() {
  const store = {
    get pendingOrdersList() {
      const items = loadCart();
      return items.length
        ? [{ id: `draft-${userKey()}`, status: 'Pendente', producer_data: {}, items }]
        : [];
    },

    async addProductToCart(offer, quantity) {
    const offerId = Number(offer?.id);
    const count = Number(quantity);
    if (!offerId || !Number.isInteger(count) || count < 1) {
      throw new Error('Informe uma quantidade válida.');
    }

    const cart = loadCart();
    const current = cart.find((item) => Number(item.offer_id) === offerId);
    const nextQuantity = Number(current?.quantity ?? 0) + count;
    const maxAvailable = Number(offer.available_quantity ?? 0);
    if (nextQuantity > maxAvailable) throw new Error(`Estoque disponível: ${maxAvailable} kg.`);

    if (current) {
      current.quantity = nextQuantity;
    } else {
      cart.push({
        id: offerId,
        offer_id: offerId,
        product: offerId,
        product_data: { name: offer.name ?? offer.product_name, category_name: offer.category_name },
        quantity: count,
        unit_price: Number(offer.unit_price ?? offer.price ?? 0),
        available_quantity: maxAvailable,
      });
    }
    saveCart();
    },

    async updateItem(_orderId, itemId, quantity) {
    const nextQuantity = Number(quantity);
    const item = loadCart().find((entry) => String(entry.id) === String(itemId));
    if (!item || !Number.isInteger(nextQuantity) || nextQuantity < 1) return;
    if (nextQuantity > item.available_quantity) throw new Error(`Estoque disponível: ${item.available_quantity} kg.`);
    item.quantity = nextQuantity;
    saveCart();
    },

    async removeItem(_orderId, itemId) {
    state.carts[userKey()] = loadCart().filter((item) => String(item.id) !== String(itemId));
    saveCart();
    },

    async checkoutOrder() {
    const cart = loadCart();
    let completedCount = 0;
    for (const item of [...cart]) {
      await apiRequest(`/offers/${item.offer_id}/purchase`, {
        method: 'POST',
        body: JSON.stringify({ quantity: Number(item.quantity) }),
      });
      state.carts[userKey()] = loadCart().filter((entry) => Number(entry.offer_id) !== Number(item.offer_id));
      saveCart();
      completedCount++;
    }
    return completedCount;
    },

    async syncPendingOrders() { return store.pendingOrdersList; },
  };
  return store;
}
