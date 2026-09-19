import { ASSETS } from '../lib/assets';

type CoinValueProps = {
  value: number | string;
  size?: number;
};

export function CoinValue({ value, size = 18 }: CoinValueProps) {
  const amount = Number(value) || 0;
  return (
    <span className="coin">
      <img
        src={ASSETS.coin}
        width={size}
        height={size}
        alt="BAC"
        decoding="async"
      />
      <b>{amount.toLocaleString()}</b>
    </span>
  );
}
