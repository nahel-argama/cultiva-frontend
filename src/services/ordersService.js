import { apiRequest } from '@/services/api';
import { useAuth } from '@/composables/useAuth';

function normalizePurchase(purchase, profileType) {
  const isSale = profileType === 'producer';
  const partyId = isSale ? purchase.retailer_id : purchase.producer_id;
  const purchaseItem = {
    id: purchase.id,
    product: purchase.source_product_id,
    product_data: { name: purchase.product_name, category_name: 'Não informada' },
    quantity: purchase.quantity,
    unit_price: purchase.unit_price,
  };

  return {
    ...purchase,
    status: 'RECORDED',
    producer: purchase.producer_id,
    retailer: purchase.retailer_id,
    producer_data: isSale ? {} : { name: `Produtor #${partyId}` },
    retailer_data: isSale ? { name: `Varejista #${partyId}` } : {},
    subtotal_value: purchase.total_price,
    fee_value: '0.00',
    total_value: purchase.total_price,
    payment_method: null,
    items: [purchaseItem],
  };
}

export async function listOrders({ page = 1, perPage = 15 } = {}) {
  const profileType = String(useAuth().profileData.value?.profile_type ?? '').toLowerCase();
  if (!['producer', 'retailer'].includes(profileType)) {
    throw new Error('O histórico está disponível apenas para produtores e varejistas.');
  }

  const endpoint = profileType === 'producer' ? '/sales' : '/purchases';
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const response = await apiRequest(`${endpoint}?${params}`);
  return {
    results: (response?.data ?? []).map((purchase) => normalizePurchase(purchase, profileType)),
    count: Number(response?.meta?.total ?? response?.data?.length ?? 0),
    next: response?.links?.next ?? null,
  };
}
