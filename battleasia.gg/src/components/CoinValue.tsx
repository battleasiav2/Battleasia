import { ASSETS } from '../lib/assets';

type CoinValueProps = {
  value: number | string;
  size?: number;
};

export function CoinValue({ value, size = 18 }: CoinValueProps) {
  const amount = Number(value) || 0;
  return (
    <span className="coin" style={{ ['--coin-size' as string]: `${size}px` }}>
      <b>{amount.toLocaleString()}</b>
      <img src={ASSETS.coin} width={size} height={size} alt="" decoding="async" aria-hidden />
    </span>
  );
}
