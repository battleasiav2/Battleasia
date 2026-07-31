// The panel is served from a sub-path in production (`/admin`), so files in
// `public/` are not reachable at the site root.
const PUBLIC_BASE = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

export function assetPath(path: string) {
  return `${PUBLIC_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
