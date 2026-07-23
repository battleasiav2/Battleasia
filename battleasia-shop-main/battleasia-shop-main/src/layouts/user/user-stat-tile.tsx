import type { ReactNode } from 'react';

import { GlassStatTile, getDefaultGlassTokens } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

type UserStatTileProps = {
  label: string;
  value: ReactNode;
  suffix?: string;
  loading?: boolean;
};

export function UserStatTile({ label, value, suffix, loading }: UserStatTileProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <GlassStatTile
      label={label}
      value={value}
      suffix={suffix}
      loading={loading}
      tokens={tokens}
    />
  );
}
