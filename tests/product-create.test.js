import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createServer } from 'vite';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
globalThis.localStorage = { getItem: () => null };
const server = await createServer({
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
});
after(async () => {
  await server.close();
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
});

const { createProduct } = await server.ssrLoadModule('/src/services/product.js');
const { default: StockCreateModal } = await server.ssrLoadModule(
  '/src/components/dashboard/views/stock/StockCreateModal.vue',
);

test('product creation sends the required Laravel offer fields', async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, ...options };
    return { ok: true, json: async () => ({ data: { id: 1 } }) };
  };
  try {
    await createProduct({
      external_id: '0002', category: '3', price: 12.5, total_quantity: 20,
      harvest_date: '2026-12-01', lifespan_days: '7',
    });

    assert.equal(new URL(request.url).pathname, '/v1/offers');
    assert.equal(request.method, 'POST');
    assert.deepEqual(JSON.parse(request.body), {
      source_product_id: '0002', category_id: 3, unit_price: '12.5', total_quantity: 20,
      harvest_date: '2026-12-01', lifespan_days: 7,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('product form collects the required harvest date and shelf life', async () => {
  const context = {};
  await renderToString(createSSRApp(StockCreateModal, { modelValue: true }), context);
  const html = context.teleports.body;

  assert.match(html, /<input\b[^>]*id="harvest_date"[^>]*type="date"[^>]*required/);
  assert.ok(html.includes(`min="${new Date().toISOString().slice(0, 10)}"`));
  assert.match(html, /<input\b[^>]*id="lifespan_days"[^>]*type="number"[^>]*min="1"[^>]*required/);
});

test('product form submits zero stock and displays Laravel validation errors', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 422,
    json: async () => ({ errors: { harvest_date: ['Data da colheita inválida.'] } }),
  });
  try {
    let modal;
    await renderToString(createSSRApp({
      setup() {
        modal = StockCreateModal.setup({ modelValue: true }, { expose() {}, emit() {} });
        return () => null;
      },
    }));
    Object.assign(modal.form, {
      external_id: '0002', category: 3, price: 12.5, total_quantity: 0,
      harvest_date: '2026-12-01', lifespan_days: 7,
    });

    await modal.handleSubmit();

    assert.equal(modal.submitError.value, 'Data da colheita inválida.');
    assert.equal(modal.isSubmitting.value, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
