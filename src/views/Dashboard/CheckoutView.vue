<template>
  <main class="dashboard-theme min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(44,169,97,0.10),_transparent_34%),linear-gradient(180deg,_#F7F5EF_0%,_#F1F4ED_100%)] text-slate-900">
    <header class="sticky top-0 z-20 border-b border-[#DFE3D9] bg-[#F7F5EF]/95 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <RouterLink to="/dashboard" class="flex items-center gap-2.5"><img src="/favicon.png" alt="" class="h-9 w-9 object-contain" /><span class="font-display text-lg font-semibold text-emerald-700">Cultiva</span></RouterLink>
        <RouterLink to="/dashboard" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-200 hover:text-emerald-700">← Voltar ao painel</RouterLink>
      </div>
    </header>

    <div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div class="max-w-2xl">
          <p class="text-xs font-bold tracking-[0.24em] text-emerald-700 uppercase">Checkout</p>
          <h1 class="mt-2 text-2xl font-black tracking-tight">Revise seu pedido</h1>
          <p class="mt-1 text-sm leading-6 text-slate-600">Confira as ofertas e os valores atualizados antes de confirmar suas compras.</p>
        </div>

        <p v-if="loading" role="status" class="mt-8 text-sm text-slate-600">Atualizando ofertas...</p>
        <section v-else-if="!items.length" class="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 class="font-bold">Seu carrinho está vazio</h2>
          <RouterLink to="/dashboard" class="mt-3 inline-block text-sm font-semibold text-emerald-700 underline">Explorar ofertas</RouterLink>
        </section>
        <div v-else class="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
          <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div class="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-4">
              <div><p class="text-xs font-bold tracking-[0.2em] text-emerald-700 uppercase">Suas escolhas</p><h2 class="mt-1 text-base font-black">Ofertas selecionadas</h2></div>
              <span class="rounded-full bg-[#F7F5EF] px-3 py-1 text-xs font-semibold text-slate-600">{{ items.length }} {{ items.length === 1 ? 'oferta' : 'ofertas' }}</span>
            </div>
            <div class="divide-y divide-slate-100">
              <article v-for="item in items" :key="item.id" class="flex flex-wrap items-start justify-between gap-3 py-4">
                <div class="min-w-0"><h3 class="text-sm font-bold">{{ item.name }}</h3><p class="mt-1 text-xs text-slate-500">Fornecedor: {{ item.supplier }}</p><p class="mt-2 text-xs text-slate-600">{{ item.quantity }} kg <span class="mx-1 text-slate-300">·</span> {{ money(item.price) }} / kg</p><p v-if="item.error" class="mt-2 text-sm font-semibold text-rose-700">{{ item.error }}</p></div>
                <p class="text-sm font-bold text-slate-900">{{ money(item.price * item.quantity) }}</p>
              </article>
            </div>
            <p class="rounded-xl bg-[#F7F5EF] px-4 py-3 text-xs leading-5 text-slate-600">Cada oferta é registrada como uma compra separada. Se alguma não puder ser concluída, as demais permanecem no carrinho.</p>
          </section>

          <aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <p class="text-xs font-bold tracking-[0.2em] text-emerald-700 uppercase">Resumo</p>
            <h2 class="mt-1 text-base font-black">Total do pedido</h2>
            <dl class="mt-4 space-y-3 text-sm text-slate-600">
              <div class="flex justify-between gap-4"><dt>Subtotal dos produtos</dt><dd>{{ money(subtotal / 100) }}</dd></div>
              <div class="flex justify-between gap-4"><dt>Taxa da plataforma (5%)</dt><dd>{{ money(fee / 100) }}</dd></div>
              <div class="flex justify-between gap-4 border-t border-slate-100 pt-4 text-base font-black text-emerald-800"><dt>Total</dt><dd>{{ money((subtotal + fee) / 100) }}</dd></div>
            </dl>
            <p v-if="error" role="alert" class="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
            <button type="button" class="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300" :disabled="submitting || completed > 0 || items.some((item) => item.error)" @click="confirmOrder">{{ submitting ? 'Registrando compras...' : 'Confirmar compras' }}</button>
          </aside>
        </div>
    </div>
    <Teleport to="body">
      <div v-if="completed > 0" class="dashboard-theme fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm" @click.self="router.push('/dashboard')">
        <section role="dialog" aria-modal="true" aria-labelledby="checkout-success-title" class="w-full max-w-md rounded-3xl border border-[#DFE3D9] bg-white p-6 text-center shadow-2xl sm:p-8">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
            <CheckIcon class="h-8 w-8 text-emerald-700" aria-hidden="true" />
          </div>
          <p class="mt-7 text-xs font-bold tracking-[0.2em] text-emerald-700 uppercase">Pedido enviado</p>
          <h2 id="checkout-success-title" class="mt-2 text-xl font-black tracking-tight text-slate-900">Compras registradas</h2>
          <p class="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-600">{{ completed }} {{ completed === 1 ? 'oferta foi registrada' : 'ofertas foram registradas' }} no seu histórico de compras.</p>
          <div class="mt-6 flex flex-col gap-2 sm:flex-row">
            <RouterLink to="/dashboard" class="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Voltar ao painel</RouterLink>
            <RouterLink to="/dashboard?tab=historico-compra" class="flex-1 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">Ver histórico</RouterLink>
          </div>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { CheckIcon } from '@heroicons/vue/24/outline';
import { getProductById } from '@/services/product';
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();
const router = useRouter();
const items = ref([]);
const loading = ref(true);
const submitting = ref(false);
const completed = ref(0);
const error = ref('');
const subtotal = computed(() => items.value.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0));
const fee = computed(() => items.value.reduce((sum, item) => sum + Math.round(Math.round(item.price * 100) * item.quantity * 0.05), 0));
const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

async function loadOffers() {
  loading.value = true;
  const cartItems = cart.pendingOrdersList.flatMap((order) => order.items);
  items.value = await Promise.all(cartItems.map(async (item) => {
    const result = { id: Number(item.offer_id), name: item.product_data?.name || 'Produto', supplier: 'Fornecedor indisponível', quantity: Number(item.quantity), price: Number(item.unit_price), error: '' };
    try {
      const offer = await getProductById(item.offer_id);
      result.name = offer.name || result.name;
      result.supplier = offer.producer_name || result.supplier;
      result.price = Number(offer.unit_price);
      if (offer.available_quantity < result.quantity) result.error = `Estoque disponível: ${offer.available_quantity} kg. Ajuste a quantidade no carrinho.`;
    } catch {
      result.error = 'Oferta indisponível. Remova-a do carrinho para continuar.';
    }
    return result;
  }));
  loading.value = false;
}

async function confirmOrder() {
  if (submitting.value || !items.value.length || items.value.some((item) => item.error)) return;
  submitting.value = true;
  error.value = '';
  try {
    completed.value = await cart.checkoutOrder(items.value.map((item) => ({ id: item.id, unit_price: item.price })));
  } catch (failure) {
    const count = failure.completedCount || 0;
    error.value = `${count ? `${count} compra(s) registrada(s). ` : ''}${failure.message || 'Não foi possível concluir as compras.'} Revise as ofertas restantes.`;
    await loadOffers();
  } finally {
    submitting.value = false;
  }
}

onMounted(loadOffers);
</script>
