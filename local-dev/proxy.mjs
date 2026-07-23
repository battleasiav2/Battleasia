import http from 'node:http';
import httpProxy from 'http-proxy';

const PROXY_PORT = 8080;
const API_TARGET = process.env.API_URL || 'http://localhost:5050';

const HOSTS = {
  'battleasia.local': 'http://localhost:8081',
  'www.battleasia.local': 'http://localhost:8081',
  'shop.battleasia.local': 'http://localhost:8082',
  'admin.battleasia.local': 'http://localhost:3000',
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

function resolveTarget(hostHeader = '') {
  const host = hostHeader.split(':')[0].toLowerCase();

  if (HOSTS[host]) {
    return HOSTS[host];
  }

  return HOSTS['battleasia.local'];
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || '';
  const url = req.url || '/';

  if (url.startsWith('/api')) {
    proxy.web(req, res, { target: API_TARGET });
    return;
  }

  proxy.web(req, res, { target: resolveTarget(host) });
});

server.on('upgrade', (req, socket, head) => {
  const host = req.headers.host || '';
  proxy.ws(req, socket, head, { target: resolveTarget(host) });
});

server.listen(PROXY_PORT, () => {
  console.log(`BattleAsia local proxy: http://battleasia.local:${PROXY_PORT}`);
  console.log(`  FE:    http://battleasia.local:${PROXY_PORT}`);
  console.log(`  Shop:  http://shop.battleasia.local:${PROXY_PORT}`);
  console.log(`  Admin: http://admin.battleasia.local:${PROXY_PORT}`);
  console.log(`  API:   ${API_TARGET}`);
});
