import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createServer } from 'vite';

const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const storage = new Map();
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

const { useAuth } = await server.ssrLoadModule('/src/composables/useAuth.js');
const PurchaseView = (await server.ssrLoadModule('/src/components/dashboard/views/PurchaseHistoryView.vue')).default;
const SalesView = (await server.ssrLoadModule('/src/components/dashboard/views/SalesHistoryView.vue')).default;
const Accordion = (await server.ssrLoadModule('/src/components/dashboard/views/history/HistoryAccordionItem.vue')).default;
const { downloadInvoice } = await server.ssrLoadModule('/src/utils/invoiceGenerator.js');
const party = {
  id: 115, role: 'producer', trade_name: 'Sítio Primavera', legal_name: 'Primavera LTDA',
  document_number: '00000000000000', name: 'Pessoa de Contato', email: 'contato@example.com', phone: '00000000000',
  address: { zip: '00000000', street: 'Rua Teste', number: '12A', complement: 'Galpão', neighborhood: 'Centro', city: 'Araras', state: 'SP' },
};
const purchase = {
  id: 30, offer_id: 5, producer_id: 115, retailer_id: 7, source_product_id: '0002',
  product_name: 'Alho', quantity: 2, unit_price: '13.00', total_price: '26.00', created_at: '2026-10-22T12:00:00Z',
  category: { id: 2, name: 'Hortaliças' }, counterparty: party,
};

async function setup(component) {
  let bindings;
  await renderToString(createSSRApp({ setup() {
    bindings = component.setup({}, { expose() {}, emit() {} });
    return () => null;
  } }));
  return bindings;
}

for (const [role, component, itemsKey, label, partyLabel] of [
  ['retailer', PurchaseView, 'purchases', 'Compra', 'Fornecedor'],
  ['producer', SalesView, 'sales', 'Venda', 'Cliente'],
]) {
  test(`${label} shows actual counterparty details and omits unsupported payment fields`, async (t) => {
    t.mock.method(globalThis, 'fetch', async (url) => ({ ok: true, json: async () => url.endsWith('/auth/login')
      ? { data: { profile_type: role, user: {}, profile: {}, tokens: {} } }
      : { data: [{ ...purchase, counterparty: { ...party, role: role === 'retailer' ? 'producer' : 'retailer' } }], meta: { total: 1, per_page: 10, current_page: 1, last_page: 1 } },
    }));
    await useAuth().login({ email: 'test@example.com', password: 'test' });
    const view = await setup(component);
    await view.load(1);
    const item = view[itemsKey].value[0];
    assert.equal(item.contractTitle, `${label} #30`);
    assert.equal(item.partyName, 'Sítio Primavera');
    assert.equal(item.partyLabel, partyLabel);
    const html = await renderToString(createSSRApp(Accordion, { item, itemKindLabel: label, isOpen: true }));
    for (const text of ['Sítio Primavera', '00.000.000/0000-00', 'Rua Teste, 12A', '00000-000', 'Pessoa de Contato', 'contato@example.com', '00000000000', 'Hortaliças', '13,00', '26,00']) assert.ok(html.includes(text), text);
    assert.doesNotMatch(html, /Forma de pagamento|Método não informado|Pagamento não registrado|Pedido #|não disponível/);
  });
}

test('missing optional counterparty/category fields do not produce fictitious details', async () => {
  const view = await setup(PurchaseView);
  const item = view.buildHistoryItem({ ...purchase, counterparty: null, category: null });
  const html = await renderToString(createSSRApp(Accordion, { item, itemKindLabel: 'Compra', isOpen: true }));
  assert.match(html, /Alho/);
  assert.doesNotMatch(html, /Produtor #|não disponível|Não informada|Forma de pagamento/);
});

test('printable receipt includes actual counterparty data and escapes user content', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  let document;
  globalThis.window = { open: () => ({ document: { open() {}, write(value) { document = value; }, close() {} } }) };
  t.after(() => { if (descriptor) Object.defineProperty(globalThis, 'window', descriptor); else delete globalThis.window; });
  downloadInvoice({ ...purchase, counterparty: { ...party, trade_name: '<script>bad()</script>' } });
  assert.match(document, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(document, /<script>bad\(\)<\/script>|>Pedido</);
  for (const text of ['00.000.000/0000-00', 'Rua Teste', '12A', 'contato@example.com', '00000000000', 'Hortaliças']) assert.ok(document.includes(text), text);
});
