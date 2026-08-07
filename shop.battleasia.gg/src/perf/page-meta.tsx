import { Helmet } from 'react-helmet-async';

export type PageMetaProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
};

const SITE = 'https://battleasia.gg';
const DEFAULT_IMAGE = `${SITE}/logo/logo.webp`;

/**
 * SEO-friendly document head for public pages.
 * Keep titles unique; descriptions ~150–160 chars.
 */
export function PageMeta({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  noIndex = false,
  type = 'website',
}: PageMetaProps) {
  const url = path.startsWith('http') ? path : `${SITE}${path.startsWith('/') ? path : `/${path}`}`;
  const fullTitle = title.includes('BattleAsia') ? title : `${title} | BattleAsia`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="BattleAsia" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
