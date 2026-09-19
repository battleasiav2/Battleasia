import { useEffect } from 'react';
import { useI18n } from '../lib/i18n';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function Seo() {
  const { t, locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('seo.title');
    setMeta('description', t('seo.desc'));
    setMeta('og:title', t('seo.title'), 'property');
    setMeta('og:description', t('seo.desc'), 'property');
    setMeta('og:url', 'https://battleasia.gg/dashboard', 'property');
    setMeta('og:image', 'https://battleasia.gg/assets/hero/hero-poster.webp', 'property');
    setMeta('twitter:title', t('seo.title'));
    setMeta('twitter:description', t('seo.desc'));
  }, [t, locale]);

  return null;
}
