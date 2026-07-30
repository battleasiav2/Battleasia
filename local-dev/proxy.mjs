import http from 'node:http';
import httpProxy from 'http-proxy';

const PROXY_PORT = Number(process.env.PROXY_PORT) || 8080;
const API_TARGET = process.env.API_URL || 'http://localhost:5050';
const FE_TARGET = process.env.FE_URL || 'http://localhost:8081';
const SHOP_TARGET = process.env.SHOP_URL || 'http://localhost:8082';
const ADMIN_TARGET = process.env.ADMIN_URL || 'http://localhost:3000';

/** Legacy multi-host dev (optional hosts file entries). */
const HOSTS = {
  'battleasia.local': FE_TARGET,
  'www.battleasia.local': FE_TARGET,
  'shop.battleasia.local': SHOP_TARGET,
  'admin.battleasia.local': ADMIN_TARGET,
};

const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true,
  xfwd: true,
});

proxy.on('error', (error, req, res) => {
  console.error(`[proxy] ${req.headers.host}${req.url}:`, error.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Bad gateway. Make sure the target dev server is running.');
});

function resolvePathTarget(url = '/') {
  if (url.startsWith('/api') || url.startsWith('/uploads') || url.startsWith('/socket.io')) {
    return API_TARGET;
  }
  if (url === '/store' || url.startsWith('/store/')) {
    return SHOP_TARGET;
  }
  if (url === '/admin' || url.startsWith('/admin/')) {
    return ADMIN_TARGET;
  }
  return FE_TARGET;
}

function resolveHostTarget(hostHeader = '') {
  const host = hostHeader.split(':')[0].toLowerCase();
  return HOSTS[host] || null;
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || '';
  const url = req.url || '/';

  const hostTarget = resolveHostTarget(host);
  const target = hostTarget || resolvePathTarget(url);

  proxy.web(req, res, { target });
});

server.on('upgrade', (req, socket, head) => {
  const host = req.headers.host || '';
  const url = req.url || '/';
  const hostTarget = resolveHostTarget(host);
  const target = hostTarget || resolvePathTarget(url);
  proxy.ws(req, socket, head, { target });
});

server.listen(PROXY_PORT, () => {
  console.log(`BattleAsia local proxy: http://localhost:${PROXY_PORT}`);
  console.log('  Single domain paths:');
  console.log(`    /         -> ${FE_TARGET}`);
  console.log(`    /store/   -> ${SHOP_TARGET}`);
  console.log(`    /admin/   -> ${ADMIN_TARGET}`);
  console.log(`    /api/     -> ${API_TARGET}`);
  console.log('  Legacy hosts: battleasia.local, shop.battleasia.local, admin.battleasia.local');
});
