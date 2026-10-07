export type PayKind = 'bkash' | 'nagad' | 'crypto';

const MARK: Record<PayKind, string> = {
  bkash: '/assets/pay/bkash.png',
  nagad: '/assets/pay/nagad.png',
  crypto: '/assets/pay/usdt.png',
};

export function payKindFromName(name: string): PayKind | null {
  const n = name.toLowerCase();
  if (n.includes('bkash') || n.includes('b-kash')) return 'bkash';
  if (n.includes('nagad')) return 'nagad';
  if (n.includes('crypto') || n.includes('usdt') || n.includes('tether')) return 'crypto';
  return null;
}

export function PayPicks({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: PayKind) => void;
}) {
  const items: { id: PayKind; label: string }[] = [
    { id: 'bkash', label: 'bKash' },
    { id: 'nagad', label: 'Nagad' },
    { id: 'crypto', label: 'Crypto' },
  ];
  return (
    <div className="pay-picks" role="radiogroup" aria-label="Payment method">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`pay-pick${value === item.id ? ' active' : ''}`}
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
        >
          <PayBrand kind={item.id} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function PayBrand({ kind }: { kind: PayKind }) {
  return (
    <span className={`pay-brand pay-brand--${kind}`}>
      <img src={MARK[kind]} alt="" width={64} height={64} draggable={false} />
    </span>
  );
}
