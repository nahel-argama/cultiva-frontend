import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const args = process.argv.slice(2);
const modeIndex = args.indexOf('--mode');
const mode = args.find((arg) => arg.startsWith('--mode='))?.slice(7)
  ?? (modeIndex === -1 ? 'development' : args[modeIndex + 1]);
const env = { ...process.env };
const { VITE_API_BASE_URL: backend } = loadEnv(mode, process.cwd());

if (/^https:\/\/[^/]+\.ngrok-free\.dev(?:\/|$)/i.test(backend ?? '')) {
  if (await isTunnelOnline(backend)) {
    console.log(`Backend via ngrok: ${backend}`);
  } else {
    env.VITE_API_BASE_URL = 'http://localhost';
    console.log('Ngrok indisponível. Usando o backend em http://localhost.');
  }
}

const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const server = spawn(process.execPath, [vite, ...args], { env, stdio: 'inherit' });
server.on('exit', (code) => { process.exitCode = code ?? 0; });

async function isTunnelOnline(backendUrl) {
  try {
    const response = await fetch(new URL('/v1/offers', backendUrl), {
      headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': '1' },
      signal: AbortSignal.timeout(2500),
    });
    await response.body?.cancel();
    return (response.ok || response.status === 401)
      && Boolean(response.headers.get('content-type')?.includes('application/json'));
  } catch {
    return false;
  }
}
