import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createServer } from 'vite';

const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
globalThis.localStorage = { getItem: (key) => key === 'cultiva.auth_data' ? JSON.stringify({ profile_type: 'retailer' }) : null };
const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(async () => {
  await server.close();
  if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
  else delete globalThis.localStorage;
});

const product = await server.ssrLoadModule('/src/services/product.js');
const wishlist = await server.ssrLoadModule('/src/services/wishlist.js');
const orders = await server.ssrLoadModule('/src/services/ordersService.js');
const views = {};
for (const name of ['StockView', 'ExploreOffersView', 'WishlistView', 'PurchaseHistoryView', 'SalesHistoryView']) {
  views[name] = (await server.ssrLoadModule(`/src/components/dashboard/views/${name}.vue`)).default;
}
const AppPagination = (await server.ssrLoadModule('/src/components/ui/AppPagination.vue')).default;

function payload(data = [], page = 2, perPage = 7, total = 30) {
  return { data, meta: { current_page: page, per_page: perPage, total, last_page: Math.max(1, Math.ceil(total / perPage)) }, links: { next: 'next-page' } };
}

async function setup(component, props = {}, emit = () => {}) {
  let bindings;
  await renderToString(createSSRApp({ setup() {
    bindings = component.setup(props, { expose() {}, emit });
    return () => null;
  } }));
  return bindings;
}

test('all list services consume Laravel pagination metadata without downloading extra pages', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => payload() }));
  for (const service of [product.listProducts, wishlist.listWishlistItems, orders.listOrders]) {
    const data = await service({ page: 2, perPage: 7 });
    assert.equal(data.count, 30);
    assert.equal(data.page, 2);
    assert.equal(data.perPage, 7);
    assert.equal(data.lastPage, 5);
  }
  assert.equal(fetchMock.mock.callCount(), 3);
});

test('pagination discards stale responses and uses the server page size', async () => {
  const { usePaginatedList } = await server.ssrLoadModule('/src/composables/usePaginatedList.js');
  const pending = [];
  const list = usePaginatedList(() => new Promise((resolve) => pending.push(resolve)), 12);
  const first = list.load(1);
  const second = list.load(2);
  pending[1]({ results: [{ id: 2 }], count: 30, page: 2, perPage: 7, lastPage: 5 });
  await second;
  pending[0]({ results: [{ id: 1 }], count: 1, page: 1, perPage: 12, lastPage: 1 });
  await first;
  assert.equal(list.currentPage.value, 2);
  assert.equal(list.itemsPerPage.value, 7);
  assert.equal(list.totalItems.value, 30);
  assert.deepEqual(list.items.value, [{ id: 2 }]);
  assert.equal(list.isLoading.value, false);
});

test('pagination recovers when a deletion makes the requested page disappear', async () => {
  const { usePaginatedList } = await server.ssrLoadModule('/src/composables/usePaginatedList.js');
  const calls = [];
  const list = usePaginatedList(async ({ page }) => {
    calls.push(page);
    return { results: page === 2 ? [] : [{ id: 1 }], count: 1, page, perPage: 12, lastPage: 1 };
  }, 12);
  await list.load(2);
  assert.deepEqual(calls, [2, 1]);
  assert.equal(list.currentPage.value, 1);
  assert.equal(list.totalItems.value, 1);
});

test('pagination exposes request failures without presenting a misleading page', async () => {
  const { usePaginatedList } = await server.ssrLoadModule('/src/composables/usePaginatedList.js');
  const list = usePaginatedList(async () => { throw new Error('Falha na API.'); }, 12);
  await list.load(2);
  assert.equal(list.error.value, 'Falha na API.');
  assert.equal(list.currentPage.value, 1);
  assert.equal(list.isLoading.value, false);
});

for (const name of Object.keys(views)) {
  test(`${name} loads one requested server page and respects returned metadata`, async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => payload() }));
    const view = await setup(views[name]);
    view.searchTerm.value = ' tomate ';
    await view.load(2);
    assert.equal(fetchMock.mock.callCount(), 1);
    const url = new URL(fetchMock.mock.calls[0].arguments[0]);
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(url.searchParams.get('search'), 'tomate');
    assert.equal(view.currentPage.value, 2);
    assert.equal(view.itemsPerPage.value, 7);
    assert.equal(view.totalItems.value, 30);
  });

  test(`${name} resets to the first server page when the search changes`, async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => payload([], 1) }));
    const view = await setup(views[name]);
    view.currentPage.value = 4;
    view.onSearch('tomate');
    t.mock.timers.tick(400);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(fetchMock.mock.callCount(), 1);
    const url = new URL(fetchMock.mock.calls[0].arguments[0]);
    assert.equal(url.searchParams.get('page'), '1');
    assert.equal(url.searchParams.get('search'), 'tomate');
    assert.equal(view.currentPage.value, 1);
  });
}

test('stock creation reloads the current page instead of adding a thirteenth row', async (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  globalThis.window = { setTimeout() {} };
  t.after(() => { if (descriptor) Object.defineProperty(globalThis, 'window', descriptor); else delete globalThis.window; });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => payload([], 2, 12, 13) }));
  const view = await setup(views.StockView);
  view.currentPage.value = 2;
  view.products.value = [{ id: 1 }];
  await view.onProductCreated({ id: 99, name: 'Tomate' });
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(new URL(fetchMock.mock.calls[0].arguments[0]).searchParams.get('page'), '2');
  assert.deepEqual(view.products.value, []);
  assert.equal(view.totalItems.value, 13);
});

test('clearing stock refreshes the same page because the offer is not deleted', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => payload([{ id: 9 }], 2, 12, 13) }));
  const view = await setup(views.StockView);
  view.currentPage.value = 2;
  view.products.value = [{ id: 9 }];
  await view.refreshStock();
  assert.equal(new URL(fetchMock.mock.calls[0].arguments[0]).searchParams.get('page'), '2');
  assert.equal(view.currentPage.value, 2);
  assert.equal(view.products.value[0].id, 9);
});

test('pagination controls use metadata and reject navigation while loading', async () => {
  const events = [];
  const pager = await setup(AppPagination, { modelValue: 2, totalItems: 30, itemsPerPage: 7, loading: true }, (...event) => events.push(event));
  pager.goTo(3);
  assert.deepEqual(events, []);
  const html = await renderToString(createSSRApp(AppPagination, { modelValue: 2, totalItems: 30, itemsPerPage: 7, loading: true }));
  assert.match(html, /8–14 de 30/);
  assert.equal((html.match(/<button\b[^>]*\sdisabled(?:[>\s])/g) ?? []).length, 2);
});

test('offer quantity uses authoritative stock and rejects fractional purchases', async () => {
  const OfferCard = (await server.ssrLoadModule('/src/components/dashboard/views/offers/OfferCard.vue')).default;
  const card = await setup(OfferCard, {
    item: { id: 7, name: 'Tomate', total_quantity: 100, reserved_quantity: 0, available_quantity: 4 },
    cartQuantity: 0, isAdding: false,
  });
  assert.equal(card.availableQuantity.value, 4);
  card.selectedQuantity.value = 1.5;
  assert.equal(card.canAddToCart.value, false);
  card.normalizeQuantity();
  assert.equal(card.selectedQuantity.value, 1);
});
