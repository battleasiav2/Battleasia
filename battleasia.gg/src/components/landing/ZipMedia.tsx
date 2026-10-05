import { mediaUrl } from '../UserAvatar';

const COIN = '/assets/fw/bac-coin.webp';

export const ZIP_PLAYER_PHOTOS = [
  '/assets/fw/players/player-shadownova.jpg',
  '/assets/fw/players/player-ravenx.jpg',
  '/assets/fw/players/player-kitestorm.jpg',
  '/assets/fw/players/player-miraace.jpg',
];

export function ZipAmount({ value, size = 'xs' }: { value: number; size?: 'xs' | 'md' }) {
  const px = size === 'md' ? 28 : 16;
  return (
    <span className="bac-unit">
      <img src={COIN} alt="" className={`bac-coin bac-coin--${size}`} width={px} height={px} />
      <span>{Number(value || 0).toLocaleString()} BAC</span>
    </span>
  );
}

export function ZipAvatar({ src, index = 0, size = 36 }: { src?: string | null; index?: number; size?: number }) {
  const photo = mediaUrl(src) || ZIP_PLAYER_PHOTOS[index % ZIP_PLAYER_PHOTOS.length];
  return (
    <span className="avatar avatar--photo" style={{ width: size, height: size }}>
      <img src={photo} alt="" width={size} height={size} loading="lazy" decoding="async" />
    </span>
  );
}
