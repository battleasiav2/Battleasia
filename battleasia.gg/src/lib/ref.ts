const KEY = 'battleasia_ref';

export function captureReferral() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    localStorage.setItem(KEY, ref.trim());
  }
}

export function readReferral() {
  return localStorage.getItem(KEY) || '';
}
