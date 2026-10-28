import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { createServer } from 'vite';
import { createRenderer, createSSRApp, nextTick, ssrContextKey } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';

const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const storage = new Map([['cultiva.access_token', 'test-access-token']]);
beforeEach(() => storage.set('cultiva.access_token', 'test-access-token'));
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(async () => {
  await server.close();
  if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
  else delete globalThis.localStorage;
});

const api = await server.ssrLoadModule('/src/services/api.js');
const wishlist = await server.ssrLoadModule('/src/services/wishlist.js');
const geo = await server.ssrLoadModule('/src/services/brasilApi.js');
const products = await server.ssrLoadModule('/src/services/product.js');
const { listCategories } = await server.ssrLoadModule('/src/services/category.js');
const { useAuthStore } = await server.ssrLoadModule('/src/stores/auth.js');
const { useAuth } = await server.ssrLoadModule('/src/composables/useAuth.js');
const { useCartStore } = await server.ssrLoadModule('/src/stores/cart.js');
const { listOrders } = await server.ssrLoadModule('/src/services/ordersService.js');
const { default: RegisterView } = await server.ssrLoadModule('/src/views/Auth/RegisterView.vue');
const { default: WishlistView } = await server.ssrLoadModule('/src/components/dashboard/views/WishlistView.vue');
const { default: ExploreOffersView } = await server.ssrLoadModule('/src/components/dashboard/views/ExploreOffersView.vue');
const { default: WishlistProductCard } = await server.ssrLoadModule('/src/components/dashboard/views/wishlist/WishlistProductCard.vue');
const { useToast } = await server.ssrLoadModule('/src/composables/useToast.js');

async function setupComponent(component, props = {}) {
  let bindings;
  await renderToString(createSSRApp({
    setup() {
      bindings = component.setup(props, { expose() {}, emit() {} });
      return () => null;
    },
  }));
  return bindings;
}

function mockToastTimer(t) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  globalThis.window = { setTimeout() {} };
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else delete globalThis.window;
  });
}

test('Laravel errors expose field validation messages and status', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false, status: 422,
    json: async () => ({ message: 'Dados inválidos.', errors: { capacity: ['Informe a capacidade.'] } }),
  }));
  await assert.rejects(api.apiRequest('/auth/signup'), (error) => {
    assert.equal(error.status, 422);
    assert.equal(error.message, 'Informe a capacidade.');
    assert.deepEqual(error.payload.errors.capacity, ['Informe a capacidade.']);
    return true;
  });
});

test('delivery signup preserves the required vehicle capacity', async (t) => {
  let sent;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    sent = { url, ...options };
    return { ok: true, json: async () => ({ data: null }) };
  });
  await useAuthStore().signup({
    profile_type: 'delivery',
    delivery: { cnh_number: '12345678901', cnh_category: 'B', vehicle: { plate: 'ABC1D23', cargo_type: 'dry', capacity: 1500.5 } },
  });
  assert.equal(new URL(sent.url).pathname, '/v1/auth/signup');
  assert.equal(sent.method, 'POST');
  assert.equal(JSON.parse(sent.body).delivery.vehicle.capacity, 1500.5);
});

test('registration validates capacity and advances without fictitious availability checks', async (t) => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  globalThis.window = { setTimeout() {} };
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected request'); });
  try {
    let registration;
    const router = createRouter({ history: createMemoryHistory(), routes: [] });
    await renderToString(createSSRApp({
      setup() {
        registration = RegisterView.setup({}, { expose() {} });
        return () => null;
      },
    }).use(router));
    Object.assign(registration.form, {
      name: 'Pessoa Teste', email: 'test@example.com', nome_fantasia: 'Empresa Teste', password: 'Password123!',
      type: 'delivery', documento: '00000000000000', phone: '00000000000',
      cnh_number: '12345678901', vehicle_plate: 'ABC1D23',
    });
    await registration.nextStep();
    assert.equal(registration.currentStep.value, 2);
    for (const capacity of ['', 0, -1, Number.NaN]) {
      registration.form.vehicle_capacity = capacity;
      assert.equal(registration.validateDeliveryFields(), false);
      assert.equal(registration.errors.vehicle_capacity, 'Informe uma capacidade maior que zero.');
    }
    registration.form.vehicle_capacity = 1500.5;
    await registration.nextStep();
    assert.equal(registration.errors.vehicle_capacity, '');
    assert.equal(registration.currentStep.value, 3);
    assert.equal(fetchMock.mock.callCount(), 0);

    registration.form.name = 'Pessoa 2';
    registration.form.nome_fantasia = 'Empresa 123';
    registration.form.numero = '12A';
    assert.equal(registration.validateName(), true);
    assert.equal(registration.validateNomeFantasia(), true);
    assert.equal(registration.validateNumero(), true);
    registration.form.numero = 'S/N';
    assert.equal(registration.validateNumero(), true);
    registration.form.name = 'a'.repeat(101);
    registration.form.nome_fantasia = 'a'.repeat(101);
    registration.form.numero = 'a'.repeat(21);
    assert.equal(registration.validateName(), false);
    assert.equal(registration.validateNomeFantasia(), false);
    assert.equal(registration.validateNumero(), false);

    let finishLookup;
    fetchMock.mock.restore();
    const cepFetch = t.mock.method(globalThis, 'fetch', () => new Promise((resolve) => { finishLookup = resolve; }));
    registration.form.cep = '01001-000';
    const firstLookup = registration.handleCepBlur();
    const repeatedLookup = registration.handleCepBlur();
    finishLookup({ ok: true, json: async () => ({ street: 'Praça da Sé', neighborhood: 'Sé', city: 'São Paulo', state: 'SP' }) });
    assert.equal(cepFetch.mock.callCount(), 1, 'Watcher and blur must not duplicate an in-flight CEP lookup');
    await Promise.all([firstLookup, repeatedLookup]);
    assert.equal(registration.form.rua, 'Praça da Sé');
  } finally {
    if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor);
    else delete globalThis.window;
  }
});

test('CEP lookup uses Laravel and its address response', async (t) => {
  const address = { zip_code: '01001000', street: 'Praça da Sé', neighborhood: 'Sé', city: 'São Paulo', state: 'SP' };
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => address }));
  assert.deepEqual(await geo.fetchAddressByCep('01001000'), address);
  assert.equal(new URL(fetchMock.mock.calls[0].arguments[0]).pathname, '/v1/consult/cep/01001000');
});

test('catalog and suggested prices keep using product-source', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => [] }));
  await products.searchProducts('feijão');
  await products.getSuggestedProductPrice('0002', 'SP');
  const [search, price] = fetchMock.mock.calls.map((call) => new URL(call.arguments[0]));
  assert.equal(search.origin, 'http://localhost:8001');
  assert.equal(search.pathname, '/api/products/search');
  assert.equal(search.searchParams.get('query'), 'feijão');
  assert.equal(price.origin, 'http://localhost:8001');
  assert.equal(price.pathname, '/api/products/0002/prices');
  assert.equal(price.searchParams.get('state'), 'sp');
});

test('wishlist reads Laravel pagination and passes search parameters', async (t) => {
  const item = { id: 9, source_product_id: '0002', product_name: 'Tomate', state: 'SP' };
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({
    ok: true, json: async () => ({ data: [item], meta: { total: 25, current_page: 2, per_page: 12, last_page: 3 }, links: { next: null } }),
  }));
  assert.deepEqual(await wishlist.listWishlistItems({ productName: 'tomate', page: 2 }), { results: [item], count: 25, page: 2, perPage: 12, lastPage: 3 });
  const url = new URL(fetchMock.mock.calls[0].arguments[0]);
  assert.equal(url.pathname, '/v1/wishlist/items');
  assert.equal(url.searchParams.get('search'), 'tomate');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('per_page'), '12');
});

test('wishlist writes to Laravel with the catalog string ID and deletes with no content', async (t) => {
  const item = { id: 9, source_product_id: '0002', product_name: 'Tomate' };
  const fetchMock = t.mock.method(globalThis, 'fetch', async (_url, options) => ({
    ok: true,
    json: async () => {
      if (options.method === 'DELETE') throw new SyntaxError('No content');
      return { data: item };
    },
  }));
  assert.deepEqual(await wishlist.addProductToWishlist({ id: '0002', name: 'Tomate' }), item);
  await wishlist.removeProductFromWishlist(9);
  const [create, remove] = fetchMock.mock.calls.map((call) => call.arguments);
  assert.equal(new URL(create[0]).pathname, '/v1/wishlist/items');
  assert.equal(create[1].method, 'POST');
  assert.deepEqual(JSON.parse(create[1].body), { product_id: '0002' });
  assert.equal(create[1].headers.get('Authorization'), 'Bearer test-access-token');
  assert.equal(new URL(remove[0]).pathname, '/v1/wishlist/items/9');
  assert.equal(remove[1].method, 'DELETE');
});

test('wishlist duplicate conflicts remain observable', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 409, json: async () => ({ message: 'Produto já adicionado.' }) }));
  await assert.rejects(wishlist.addProductToWishlist({ id: '0002' }), (error) => error.status === 409);
});

test('wishlist renders an item returned by Laravel', async () => {
  const html = await renderToString(createSSRApp(WishlistProductCard, {
    item: { id: 9, source_product_id: '0002', product_name: 'tomate' },
  }));
  assert.match(html, /Tomate/);
});

test('wishlist creation refreshes the current filtered page instead of appending', async (t) => {
  mockToastTimer(t);
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ data: [{ id: 1, product_name: 'Tomate' }], meta: { total: 13, current_page: 2, per_page: 12, last_page: 2 } }) }));
  const view = await setupComponent(WishlistView);
  view.searchTerm.value = 'tomate';
  view.currentPage.value = 2;
  view.wishlistItems.value = [{ id: 1, product_name: 'Tomate' }];
  await view.onItemCreated({ id: 9, product_name: 'Alface' });

  assert.equal(fetchMock.mock.callCount(), 1);
  const url = new URL(fetchMock.mock.calls[0].arguments[0]);
  assert.equal(url.searchParams.get('search'), 'tomate');
  assert.equal(url.searchParams.get('page'), '2');
  assert.deepEqual(view.wishlistItems.value, [{ id: 1, product_name: 'Tomate' }]);
  assert.equal(view.totalItems.value, 13);
});

test('wishlist network failures are visible and failed deletion preserves the item', async (t) => {
  mockToastTimer(t);
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 503, json: async () => ({ message: 'Serviço indisponível.' }) }));
  const view = await setupComponent(WishlistView);
  await view.load(1);
  assert.equal(view.error.value, 'Serviço indisponível.');

  const card = await setupComponent(WishlistProductCard, { item: { id: 9, product_name: 'Tomate' } });
  const beforeRemoval = useToast().state.items.length;
  await card.handleRemove();
  assert.equal(useToast().state.items.length, beforeRemoval + 1);
  assert.equal(useToast().state.items.at(-1).message, 'Serviço indisponível.');
  assert.equal(card.isRemoving.value, false);
});

test('offer list, detail, update and categories match Laravel contracts', async (t) => {
  const offer = { id: 7, product_name: 'Tomate', unit_price: '12.50', total_quantity: 20, reserved_quantity: 5, available_quantity: 15, category: { id: 2, name: 'Hortaliças' } };
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: new URL(url), ...options });
    const data = url.includes('categories') ? [{ id: 2, name: 'Hortaliças' }] : url.includes('?') ? [offer] : offer;
    return { ok: true, json: async () => ({ data, meta: { total: 25, current_page: 2, per_page: 12, last_page: 3 }, links: { next: null } }) };
  });
  const page = await products.listProducts({ page: 2 });
  assert.equal(page.count, 25);
  assert.equal(page.results[0].name, 'Tomate');
  assert.equal(page.results[0].available_quantity, 15);
  assert.equal(calls[0].url.pathname, '/v1/offers');
  assert.equal(calls[0].url.searchParams.get('page'), '2');
  assert.equal((await products.getProductById(7)).id, 7);
  assert.equal(calls[1].url.pathname, '/v1/offers/7');
  await products.updateProduct(7, { price: 15.5, total_quantity: 30 });
  assert.equal(calls[2].method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[2].body), { unit_price: '15.5', total_quantity: 30 });
  assert.deepEqual(await listCategories(), [{ id: 2, name: 'Hortaliças' }]);
  assert.equal(calls[3].url.pathname, '/v1/products/categories');
});

test('clearing available stock preserves reserved quantity without a DELETE request', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: new URL(url), ...options });
    return { ok: true, json: async () => ({ data: { id: 7, total_quantity: 20, reserved_quantity: 5 } }) };
  });
  await products.clearAvailableStock(7);
  assert.equal(calls[0].url.pathname, '/v1/offers/7');
  assert.equal(calls[1].method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[1].body), { total_quantity: 5 });
});

test('checkout uses Laravel purchases and preserves pending items after partial failure', async (t) => {
  const cart = useCartStore();
  await cart.addProductToCart({ id: 71, name: 'Tomate', available_quantity: 10, unit_price: '12.50' }, 2);
  await cart.addProductToCart({ id: 72, name: 'Alface', available_quantity: 10, unit_price: '3.00' }, 1);
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: new URL(url), ...options });
    return calls.length === 1
      ? { ok: true, json: async () => ({ data: { id: 1 } }) }
      : { ok: false, status: 422, json: async () => ({ message: 'Estoque insuficiente.' }) };
  });
  await assert.rejects(cart.checkoutOrder(), /Estoque insuficiente/);
  assert.equal(calls[0].url.pathname, '/v1/offers/71/purchase');
  assert.equal(calls[0].method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].body), { quantity: 2 });
  assert.deepEqual(cart.pendingOrdersList[0].items.map((item) => item.offer_id), [72]);
});

test('confirmed purchases refresh offers with the current search and page, including partial checkout', async (t) => {
  const cart = useCartStore();
  for (const order of cart.pendingOrdersList) {
    for (const item of [...order.items]) await cart.removeItem(order.id, item.id);
  }
  await cart.addProductToCart({ id: 81, available_quantity: 10 }, 2);
  await cart.addProductToCart({ id: 82, available_quantity: 10 }, 1);
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: new URL(url), ...options });
    if (url.includes('/offers/82/purchase')) {
      return { ok: false, status: 422, json: async () => ({ message: 'Estoque insuficiente.' }) };
    }
    return { ok: true, json: async () => ({ data: [], meta: { total: 12, current_page: 2, per_page: 12, last_page: 2 } }) };
  });
  let view;
  const renderer = createRenderer({
    createComment: () => ({}), insert() {}, remove() {},
    parentNode: () => null, nextSibling: () => null,
  });
  const app = renderer.createApp({ setup() {
    view = ExploreOffersView.setup({}, { expose() {} });
    return () => null;
  } });
  app.provide(ssrContextKey, { modules: new Set() });
  app.mount({});
  t.after(() => app.unmount());
  await new Promise((resolve) => setImmediate(resolve));
  view.searchTerm.value = 'tomate';
  view.currentPage.value = 2;
  calls.length = 0;
  await assert.rejects(cart.checkoutOrder(), /Estoque insuficiente/);
  await nextTick();
  assert.equal(calls.filter((call) => call.url.pathname === '/v1/offers').length, 1);
  const refresh = calls.find((call) => call.url.pathname === '/v1/offers').url;
  assert.equal(refresh.pathname, '/v1/offers');
  assert.equal(refresh.searchParams.get('search'), 'tomate');
  assert.equal(refresh.searchParams.get('page'), '2');

  calls.length = 0;
  await assert.rejects(cart.checkoutOrder(), /Estoque insuficiente/);
  await nextTick();
  assert.equal(calls.filter((call) => call.url.pathname === '/v1/offers').length, 0);

  await cart.removeItem(null, 82);
  await cart.addProductToCart({ id: 83, available_quantity: 10 }, 1);
  calls.length = 0;
  assert.equal(await cart.checkoutOrder(), 1);
  await nextTick();
  assert.equal(calls.filter((call) => call.url.pathname === '/v1/offers').length, 1);
});

test('login and histories use native Laravel roles and pagination', async (t) => {
  for (const [role, endpoint] of [['producer', '/v1/sales'], ['retailer', '/v1/purchases']]) {
    const calls = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      calls.push({ url: new URL(url), ...options });
      const payload = url.endsWith('/auth/login')
        ? { data: { user: { name: 'Teste' }, profile_type: role, profile: {}, tokens: { access_token: 'test-access-token' } } }
        : { data: [{ id: 1, producer_id: 2, retailer_id: 3, product_name: 'Tomate', quantity: 2, unit_price: '12.50', total_price: '25.00' }], meta: { total: 20, current_page: 2, per_page: 15, last_page: 2 }, links: { next: 'next-page' } };
      return { ok: true, json: async () => payload };
    });
    await useAuth().login({ email: 'test@example.com', password: 'test-password' });
    const page = await listOrders({ page: 2 });
    assert.equal(calls[0].url.pathname, '/v1/auth/login');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[1].url.pathname, endpoint);
    assert.equal(calls[1].url.searchParams.get('page'), '2');
    assert.equal(page.count, 20);
    assert.equal(page.page, 2);
    assert.equal(page.perPage, 15);
    assert.equal(page.lastPage, 2);
    assert.equal(page.results[0].total_price, '25.00');
    t.mock.restoreAll();
  }
});
