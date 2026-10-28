import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
});
after(() => server.close());

const { default: AppSelect } = await server.ssrLoadModule('/src/components/ui/AppSelect.vue');

test('autocomplete remains editable while a search is loading', async () => {
  const html = await renderToString(createSSRApp(AppSelect, {
    autocomplete: true,
    loading: true,
  }));

  assert.match(html, /<input\b/);
  assert.doesNotMatch(html, /<input\b[^>]*\sdisabled(?:[\s=>])/);
});

test('native select remains disabled while options are loading', async () => {
  const html = await renderToString(createSSRApp(AppSelect, { loading: true }));

  assert.match(html, /<select\b[^>]*\sdisabled(?:[\s=>])/);
});
