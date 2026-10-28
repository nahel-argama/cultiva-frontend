import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { createServer } from 'vite';

const descriptors = Object.fromEntries(['localStorage', 'window'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const storage = new Map();
let redirected;
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, removeItem: (key) => storage.delete(key) };
globalThis.window = { location: { pathname: '/dashboard', search: '?tab=meu-estoque', replace: (url) => { redirected = url; } } };
beforeEach(() => {
  redirected = undefined;
  storage.clear();
  for (const key of ['access_token', 'refresh_token', 'user', 'auth_data']) storage.set(`cultiva.${key}`, 'invalid-session');
  storage.set('cultiva.cart.test', 'saved-cart');
});
const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(async () => {
  await server.close();
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});
const { apiRequest, login } = await server.ssrLoadModule('/src/services/api.js');

test('protected 401 clears only authentication and sends the user back to login', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 401, json: async () => ({ message: 'Unauthenticated.' }) }));
  await assert.rejects(apiRequest('/offers?page=1'), (error) => error.status === 401);
  for (const key of ['access_token', 'refresh_token', 'user', 'auth_data']) assert.equal(storage.has(`cultiva.${key}`), false);
  assert.equal(storage.get('cultiva.cart.test'), 'saved-cart');
  assert.equal(redirected, '/login?redirect=%2Fdashboard%3Ftab%3Dmeu-estoque');
});

test('incorrect login credentials do not trigger a redirect loop', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 401, json: async () => ({ message: 'Credenciais inválidas.' }) }));
  await assert.rejects(login({ email: 'test@example.com', password: 'incorrect' }), /Credenciais inválidas/);
  assert.equal(redirected, undefined);
});

test('permission errors keep the session', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 403, json: async () => ({ message: 'Forbidden.' }) }));
  await assert.rejects(apiRequest('/offers'), (error) => error.status === 403);
  assert.equal(storage.has('cultiva.access_token'), true);
  assert.equal(redirected, undefined);
});
